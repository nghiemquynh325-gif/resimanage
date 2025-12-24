import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatarUrl} 
            alt={post.author.name} 
            className="w-10 h-10 rounded-full object-cover border border-slate-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 text-sm">{post.author.name}</h4>
              {post.author.role === 'ADMIN' && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:bg-slate-50 p-2 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      </div>
      
      {post.imageUrl && (
        <div className="w-full h-64 sm:h-80 bg-slate-50">
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Footer / Stats */}
      <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          {post.likes > 0 && (
            <>
              <div className={`rounded-full p-1 ${post.isLiked ? 'bg-red-500' : 'bg-slate-400'}`}>
                <Heart size={8} className="text-white fill-white" />
              </div>
              <span>{post.likes} lượt thích</span>
            </>
          )}
        </div>
        <div className="text-slate-500 text-xs">
          {post.comments > 0 && <span>{post.comments} bình luận</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 border-t border-slate-100 grid grid-cols-3 gap-1">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors duration-200 hover:bg-slate-50 active:scale-95 group ${
            post.isLiked ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <motion.div
            whileTap={{ scale: 0.8 }}
            animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}
          >
            <Heart 
              size={20} 
              className={`transition-colors duration-200 ${
                post.isLiked ? 'fill-red-600' : 'stroke-current group-hover:text-slate-600'
              }`} 
            />
          </motion.div>
          <span className="text-sm font-medium">Thích</span>
        </button>
        
        <button className="flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors active:scale-95">
          <MessageCircle size={20} />
          <span className="text-sm font-medium">Bình luận</span>
        </button>

        <button className="flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors active:scale-95">
          <Share2 size={20} />
          <span className="text-sm font-medium">Chia sẻ</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;