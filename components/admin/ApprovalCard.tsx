import React from 'react';
import { CheckCircle, XCircle, MapPin, Phone, Mail, User } from 'lucide-react';
import { Resident } from '../../types';
import { motion } from 'framer-motion';

interface ApprovalCardProps {
  user: Resident;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewImage: (imageUrl: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ user, onApprove, onReject, onViewImage }) => {
  // Mock ID Card Images based on user ID for demonstration
  const frontIdImage = `https://placehold.co/600x400/e2e8f0/64748b?text=CCCD+Mat+Truoc`;
  const backIdImage = `https://placehold.co/600x400/e2e8f0/64748b?text=CCCD+Mat+Sau`;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-100 flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
        <img 
          src={user.avatar} 
          alt={user.fullName} 
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">{user.fullName}</h3>
          <p className="text-xs text-slate-500 font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block mt-0.5">
            Chờ duyệt
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
             <Mail size={16} className="text-slate-400" />
             <span className="truncate">{user.email || 'Chưa cập nhật email'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
             <Phone size={16} className="text-slate-400" />
             <span>{user.phoneNumber}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600">
             <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
             <span className="line-clamp-2">{user.address}</span>
          </div>
           <div className="flex items-center gap-2 text-sm text-slate-600">
             <User size={16} className="text-slate-400" />
             <span>CCCD: <span className="font-medium text-slate-700">{user.identityCard || 'N/A'}</span></span>
          </div>
        </div>

        {/* ID Card Thumbnails */}
        <div className="mt-5 pt-3 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Ảnh CCCD/CMND</p>
          <div className="flex gap-3">
            <button 
              onClick={() => onViewImage(frontIdImage)}
              className="relative w-24 h-16 rounded-md overflow-hidden border border-slate-200 group shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
            >
              <img src={frontIdImage} alt="Mặt trước" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-1 rounded">Xem</span>
              </div>
            </button>
            <button 
              onClick={() => onViewImage(backIdImage)}
              className="relative w-24 h-16 rounded-md overflow-hidden border border-slate-200 group shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
            >
              <img src={backIdImage} alt="Mặt sau" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-1 rounded">Xem</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/30">
        <button
          onClick={() => onReject(user.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 font-semibold text-sm transition-all active:scale-95"
        >
          <XCircle size={18} />
          Từ chối
        </button>
        <button
          onClick={() => onApprove(user.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white border border-transparent rounded-lg hover:bg-green-700 font-semibold text-sm transition-all shadow-sm active:scale-95 hover:shadow"
        >
          <CheckCircle size={18} />
          Phê duyệt
        </button>
      </div>
    </motion.div>
  );
};

export default ApprovalCard;