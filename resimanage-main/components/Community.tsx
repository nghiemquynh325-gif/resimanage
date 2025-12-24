
import React, { useState, useEffect } from 'react';
import { MessageCircle, Edit2, Save, Loader2 } from 'lucide-react';
import { Role } from '../types';
import NewsFeed from './feed/NewsFeed';
import CreatePostForm from './feed/CreatePostForm';
import { useAuthStore } from '../stores/authStore';
import { getCommunitySettings, updateCommunitySettings } from '../utils/mockApi';
import Modal from './ui/Modal';
import Input from './ui/Input';

interface CommunityProps {
  role: Role;
}

const Community: React.FC<CommunityProps> = ({ role }) => {
  const { user } = useAuthStore();
  
  // Used to trigger re-fetch in NewsFeed
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Zalo Link State
  const [zaloLink, setZaloLink] = useState('https://zalo.me/g/example');
  const [isEditingZalo, setIsEditingZalo] = useState(false);
  const [newZaloLink, setNewZaloLink] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
      try {
        const settings = await getCommunitySettings();
        if (settings && settings.zaloLink) {
          setZaloLink(settings.zaloLink);
        }
      } catch (e) {
        console.error("Failed to load community settings", e);
      }
    };
    fetchSettings();
  }, []);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenEditZalo = () => {
    setNewZaloLink(zaloLink);
    setIsEditingZalo(true);
  };

  const handleSaveZaloLink = async () => {
    setIsSavingLink(true);
    try {
      await updateCommunitySettings({ zaloLink: newZaloLink });
      setZaloLink(newZaloLink);
      setIsEditingZalo(false);
    } catch (e) {
      alert("Không thể lưu link nhóm. Vui lòng thử lại.");
    } finally {
      setIsSavingLink(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tương tác Cộng đồng</h2>
        <p className="text-slate-500">Chia sẻ thông tin và thảo luận giữa cư dân và ban quản lý</p>
      </div>

      {/* Zalo Group CTA */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-xl shadow-md flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base">Tham gia nhóm Zalo Khu phố</h3>
            <p className="text-blue-100 text-xs md:text-sm">Cập nhật tin tức nhanh nhất qua Zalo</p>
          </div>
        </div>
        
        <a 
          href={zaloLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
        >
          Tham gia
        </a>

        {/* Edit Button for Admin */}
        {user?.role === 'ADMIN' && (
          <button 
            onClick={handleOpenEditZalo}
            className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Chỉnh sửa link nhóm"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>

      {/* Create Post Form (Admin Only) */}
      <CreatePostForm onPostCreated={handlePostCreated} />

      {/* News Feed */}
      <NewsFeed key={refreshKey} />

      {/* Edit Zalo Link Modal */}
      <Modal
        isOpen={isEditingZalo}
        onClose={() => setIsEditingZalo(false)}
        title="Cập nhật Link nhóm Zalo"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Dán đường dẫn nhóm Zalo mới vào bên dưới. Cư dân sẽ được chuyển hướng đến nhóm này khi bấm "Tham gia".
          </p>
          <Input 
            label="Đường dẫn nhóm (URL)" 
            value={newZaloLink}
            onChange={(e) => setNewZaloLink(e.target.value)}
            placeholder="https://zalo.me/g/..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditingZalo(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={isSavingLink}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveZaloLink}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isSavingLink}
            >
              {isSavingLink ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Community;
