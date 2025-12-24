import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Image as ImageIcon, X, Send, Loader2 } from 'lucide-react';
import { createPost } from '../../utils/mockApi';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Helper for showing toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Only Admin can see this form
  if (user?.role !== 'ADMIN') return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
        return;
      }
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    try {
      // 1. Mock Image Upload (In real app, upload to storage and get URL)
      // Here we simulate by generating a placeholder if a file was selected
      let imageUrl = undefined;
      if (imageFile) {
        // Use a random seed to get different images
        imageUrl = `https://picsum.photos/seed/${Date.now()}/800/400`;
      }

      // 2. Call API
      await createPost({
        author: {
          name: user.fullName,
          role: user.role,
          avatarUrl: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff`,
        },
        content: content,
        imageUrl: imageUrl,
      });

      // 3. Reset Form
      setContent('');
      handleRemoveImage();

      // 4. Notify Parent
      onPostCreated();
      showToast('Đăng bài viết thành công!', 'success');

    } catch (error) {
      showToast('Có lỗi xảy ra khi đăng bài.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff`}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm transition-all"
              placeholder={`Bạn đang nghĩ gì, ${user.fullName}?`}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />

            {/* Image Preview Area */}
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              // Image Upload Trigger
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <ImageIcon size={24} className="mb-1" />
                <span className="text-xs font-medium">Thêm ảnh vào bài viết</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageFile) || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Đăng bài
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </>
  );
};

export default CreatePostForm;