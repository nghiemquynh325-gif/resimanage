
import React, { useState, useEffect } from 'react';
import { usePendingApprovals } from '../../hooks/usePendingApprovals';
import ApprovalCard from '../../components/admin/ApprovalCard';
import ApprovalCardSkeleton from '../../components/skeletons/ApprovalCardSkeleton';
import { X, Inbox, Loader2, AlertCircle, CheckCircle2, Users, UserCog } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import { getPendingAdminStaff, approveAdminStaff, rejectAdminStaff } from '../../utils/mockApi';
import type { AdminStaff } from '../../types';

/**
 * Admin Approvals Page.
 * Displays a grid of pending resident registration requests.
 * Allows admins to:
 * - View ID card images.
 * - Approve requests (activates account).
 * - Reject requests (with a mandatory reason).
 */
const ApprovalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'residents' | 'admin'>('residents');
  const { pendingUsers, isLoading, approveUser, rejectUser } = usePendingApprovals();

  // Admin staff state
  const [pendingAdminStaff, setPendingAdminStaff] = useState<AdminStaff[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  // State for image lightbox
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch admin staff when tab changes
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminStaff();
    }
  }, [activeTab]);

  const fetchAdminStaff = async () => {
    setIsLoadingAdmin(true);
    try {
      const data = await getPendingAdminStaff();
      setPendingAdminStaff(data);
    } catch (error) {
      // Error fetching admin staff
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: string) => {
    const user = pendingUsers.find(u => u.id === id);
    const result = await approveUser(id);
    if (result.success) {
      showToast(`Đã phê duyệt tài khoản ${user?.fullName} thành công`, 'success');
    } else {
      showToast('Có lỗi xảy ra khi phê duyệt', 'error');
    }
  };

  // Open Rejection Modal
  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;

    setIsRejecting(true);
    const user = pendingUsers.find(u => u.id === rejectingId);

    const result = await rejectUser(rejectingId, rejectionReason);

    setIsRejecting(false);
    setRejectingId(null);

    if (result.success) {
      showToast(`Đã từ chối yêu cầu của ${user?.fullName}`, 'success');
    } else {
      showToast('Có lỗi xảy ra khi từ chối', 'error');
    }
  };

  // Animation Variants for staggering list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-800">Yêu cầu Đăng ký Chờ duyệt</h2>
        <p className="text-slate-500">Xem xét hồ sơ và phê duyệt quyền truy cập</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('residents')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'residents'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Users size={18} />
          Cư dân ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'admin'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <UserCog size={18} />
          Cán bộ ({pendingAdminStaff.length})
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'residents' ? (
        // RESIDENTS TAB
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ApprovalCardSkeleton key={i} />
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-16 text-center"
          >
            <div className="p-6 bg-slate-100 rounded-full mb-4">
              <Inbox size={48} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">Hiện không có yêu cầu cư dân chờ duyệt.</p>
            <p className="text-sm text-gray-500 mt-1">Danh sách sẽ tự động cập nhật khi có đăng ký mới.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {pendingUsers.map(user => (
                <ApprovalCard
                  key={user.id}
                  user={user}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                  onViewImage={setViewingImage}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        // ADMIN STAFF TAB
        isLoadingAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ApprovalCardSkeleton key={i} />
            ))}
          </div>
        ) : pendingAdminStaff.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-16 text-center"
          >
            <div className="p-6 bg-slate-100 rounded-full mb-4">
              <Inbox size={48} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">Hiện không có yêu cầu cán bộ chờ duyệt.</p>
            <p className="text-sm text-gray-500 mt-1">Danh sách sẽ tự động cập nhật khi có đăng ký mới.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingAdminStaff.map(staff => (
              <div
                key={staff.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserCog size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{staff.fullName}</h3>
                      <p className="text-sm text-slate-500">{staff.position || 'Chưa rõ chức vụ'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-700">{staff.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SĐT:</span>
                    <span className="font-medium text-slate-700">{staff.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CCCD:</span>
                    <span className="font-medium text-slate-700">{staff.identityCard || 'N/A'}</span>
                  </div>
                  {staff.department && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phòng ban:</span>
                      <span className="font-medium text-slate-700">{staff.department}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      try {
                        await approveAdminStaff(staff.id);
                        showToast(`Đã phê duyệt ${staff.fullName}`, 'success');
                        fetchAdminStaff();
                      } catch (error) {
                        showToast('Có lỗi xảy ra', 'error');
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => setRejectingId(staff.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Image Modal (Lightbox) */}
      <AnimatePresence>
        {viewingImage && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center bg-transparent"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 md:top-4 md:right-4 text-white/80 hover:text-white p-2 transition-colors bg-black/20 rounded-full md:bg-transparent"
                onClick={() => setViewingImage(null)}
              >
                <X size={32} />
              </button>
              <img
                src={viewingImage}
                alt="ID Card Full"
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain border-4 border-white"
              />
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <Modal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Từ chối yêu cầu"
      >
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-2">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Bạn đang thực hiện từ chối yêu cầu đăng ký này. Vui lòng cung cấp lý do để gửi thông báo cho cư dân.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lý do từ chối *</label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
              placeholder="Nhập lý do (ví dụ: Thông tin CCCD không khớp, Địa chỉ không tồn tại...)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectingId(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              disabled={isRejecting}
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || isRejecting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRejecting ? <Loader2 size={16} className="animate-spin" /> : null}
              Xác nhận Từ chối
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && createPortal(
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-4 right-4 z-[70] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovalsPage;
