
import React from 'react';
import Modal from '../ui/Modal';
import { Resident } from '../../types';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Flag, Briefcase, BookOpen, Home } from 'lucide-react';

interface ResidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident?: Resident;
}

const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({ isOpen, onClose, resident }) => {
  if (!resident) return null;

  // Helper to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN').format(date);
    } catch {
      return dateString;
    }
  };

  // Helper to extract street part from full address to avoid duplication with Ward/Province fields
  const getDisplayStreet = () => {
    const addr = resident.address || '';
    if (resident.ward && resident.province) {
      // Try exact match removal first (Standard format: Street, Ward, Province)
      const standardSuffix = `, ${resident.ward}, ${resident.province}`;
      if (addr.endsWith(standardSuffix)) {
        return addr.substring(0, addr.length - standardSuffix.length);
      }

      // Try splitting by comma if standard suffix check fails
      const parts = addr.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        // Check if the last parts match province/ward
        if (last === resident.province && secondLast === resident.ward) {
          return parts.slice(0, parts.length - 2).join(', ');
        }
      }
    }
    return addr;
  };

  const streetDisplay = getDisplayStreet();

  // Helper component for a single detail row
  const DetailRow: React.FC<{
    icon?: React.ElementType;
    label: string;
    value?: string | React.ReactNode;
    fullWidth?: boolean;
    className?: string;
  }> = ({
    icon: Icon, label, value, fullWidth, className
  }) => (
      <div className={`flex flex-col ${fullWidth ? 'col-span-1 md:col-span-2' : ''} ${className || ''}`}>
        <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
          {Icon && <Icon size={12} />}
          {label}
        </span>
        <div className="text-sm font-medium text-slate-900 break-words">
          {value || <span className="text-slate-400 italic">Chưa cập nhật</span>}
        </div>
      </div>
    );

  const getStatusBadge = (status: string) => {
    const isActive = ['Thường trú', 'Tạm trú', 'Tạm trú có nhà', 'active'].includes(status);
    const colorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const label = status === 'active' ? 'Hoạt động' : status === 'pending_approval' ? 'Chờ duyệt' : status === 'inactive' ? 'Vô hiệu hóa' : status;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  const getResidenceTypeBadge = (residenceType?: string) => {
    if (!residenceType) return null;

    let colorClass = 'bg-gray-100 text-gray-800';
    if (residenceType === 'Thường trú') {
      colorClass = 'bg-blue-100 text-blue-800';
    } else if (residenceType === 'Tạm trú') {
      colorClass = 'bg-green-100 text-green-800';
    } else if (residenceType === 'Tạm vắng') {
      colorClass = 'bg-orange-100 text-orange-800';
    } else if (residenceType === 'Tạm trú có nhà') {
      colorClass = 'bg-purple-100 text-purple-800';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {residenceType}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Hồ sơ Cư dân"
    >
      <div className="space-y-6">
        {/* Header Section with Avatar */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-20 h-20 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-slate-200">
            <img
              src={resident.avatar}
              alt={resident.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${resident.fullName}&background=random`;
              }}
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{resident.fullName}</h3>
              {getResidenceTypeBadge(resident.residenceType)}
              {getStatusBadge(resident.status)}
              {resident.isHeadOfHousehold && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  Chủ hộ
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(resident.dob)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{resident.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow icon={Phone} label="Số điện thoại" value={resident.phoneNumber} />
              <DetailRow icon={Mail} label="Email" value={resident.email} />
              <DetailRow icon={CreditCard} label="CCCD/CMND" value={resident.identityCard} />
            </div>
          </div>

          {/* Location Info */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Nơi ở & Quê quán
            </h4>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={MapPin}
                  label="Số nhà, tên đường"
                  value={streetDisplay}
                  fullWidth
                />
                <DetailRow label="Xã/Phường" value={resident.ward} />
                <DetailRow label="Tỉnh/Thành phố" value={resident.province} />
                <DetailRow icon={Home} label="Tổ dân phố" value={resident.unit ? `Tổ ${resident.unit}` : undefined} />
              </div>
            </div>

            <DetailRow icon={Flag} label="Quê quán" value={resident.hometown} fullWidth />
          </div>

          {/* Detailed Info */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Thông tin khác
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Residence Type with color */}
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Home size={12} />
                  Loại cư trú
                </span>
                <div className="text-sm font-medium">
                  {resident.residenceType ? getResidenceTypeBadge(resident.residenceType) : <span className="text-slate-400 italic">Chưa cập nhật</span>}
                </div>
              </div>
              <DetailRow icon={User} label="Dân tộc" value={resident.ethnicity} />
              <DetailRow icon={User} label="Tôn giáo" value={resident.religion} />
              <DetailRow icon={BookOpen} label="Trình độ văn hóa" value={resident.education} />
              <DetailRow icon={Briefcase} label="Nghề nghiệp/Chuyên môn" value={resident.profession} fullWidth />
            </div>
          </div>

          {/* Notes & Special Status */}
          {(resident.specialNotes || resident.specialStatus || resident.isPartyMember) && (
            <div className="col-span-1 md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="text-sm font-bold text-yellow-700 mb-3">Ghi chú đặc biệt</h4>
              <div className="space-y-2">
                {resident.isPartyMember && (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Là Đảng viên
                  </div>
                )}
                {resident.specialStatus && (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Diện: {resident.specialStatus}
                  </div>
                )}
                {resident.specialNotes && (
                  <div className="mt-2 text-sm text-slate-700 italic border-t border-yellow-200 pt-2">
                    "{resident.specialNotes}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResidentDetailModal;
