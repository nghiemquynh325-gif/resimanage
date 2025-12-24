
import React, { useEffect, useState } from 'react';
import { fetchMock, likePost, deletePost } from '../../utils/mockApi';
import { Post } from '../../types';
import PostCard from './PostCard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const NewsFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchMock('/api/posts');
        if (response && response.data) {
          setPosts(response.data as Post[]);
        }
      } catch (err: any) {
        setError('Không thể tải bảng tin. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLike = async (postId: string) => {
    // 1. Optimistic Update
    const originalPosts = [...posts];

    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );

    // 2. Call API
    try {
      await likePost(postId);
    } catch (err) {
      // 3. Revert on Error
      setPosts(originalPosts);
      setToast({ message: "Không thể thực hiện hành động này", type: 'error' });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      // Optimistic update
      setPosts(posts.filter(p => p.id !== postId));
      setToast({ message: 'Đã xóa bài viết', type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi xóa bài viết', type: 'error' });
      // Reload posts on error
      const response = await fetchMock('/api/posts');
      if (response && response.data) {
        setPosts(response.data as Post[]);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-red-100 shadow-sm">
        <AlertCircle size={32} className="text-red-500 mb-2" />
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isLoading ? (
        // Skeleton Loaders
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-4/6 animate-pulse"></div>
            </div>
            <div className="h-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="flex justify-between mt-4 pt-4 border-t border-slate-50">
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100">
          Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ!
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))
      )}

      {/* Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NewsFeed;
