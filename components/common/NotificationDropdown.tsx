
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, Bell, X } from 'lucide-react';
import { Notification } from '../../types/notification';
import { fetchMock, markNotificationAsRead } from '../../utils/mockApi';
import { useNotificationStore } from '../../stores/notificationStore';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update global store count
  const markAsReadInStore = useNotificationStore((state) => state.markAsRead);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetchMock('/api/notifications');
        if (response && Array.isArray(response.data)) {
          setNotifications(response.data as Notification[]);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setError('Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen]);

  const handleNotificationClick = async (e: React.MouseEvent, notification: Notification) => {
    e.preventDefault(); // Prevent default link behavior to handle async logic first

    if (!notification.isRead) {
      // 1. Optimistic UI Update (Local State)
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));

      // 2. Update Global Store (Optimistic)
      markAsReadInStore(notification.id);

      // 3. Call API
      try {
        await markNotificationAsRead(notification.id);
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
    
    // 4. Close dropdown
    onClose();

    // 5. Navigate
    if (notification.link) {
        navigate(notification.link);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
      case 'error': return <AlertTriangle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-12 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Thông báo</h3>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              // Skeleton Loaders
              [1, 2, 3].map(i => (
                <div key={i} className="p-4 flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="p-8 text-center text-red-500 text-sm">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Bạn không có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.link || '#'}
                  onClick={(e) => handleNotificationClick(e, notification)}
                  className={`block p-4 transition-colors relative group ${
                    notification.isRead ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Read status indicator */}
                    {!notification.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}

                    <div className="shrink-0 mt-0.5 ml-2">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-500 font-medium' : 'text-slate-900 font-bold'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs mt-1 line-clamp-2 ${notification.isRead ? 'text-gray-400' : 'text-slate-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Xem tất cả
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
