
import React, { useState } from 'react';
import { Home, MapPin, Calendar, User, Phone, Crown, Hash } from 'lucide-react';
import Modal from '../ui/Modal';
import ResidentDetailModal from '../residents/ResidentDetailModal';
import { Household, Resident } from '../../types';

interface HouseholdDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household | null;
  members: Resident[];
}

const HouseholdDetailModal: React.FC<HouseholdDetailModalProps> = ({
  isOpen,
  onClose,
  household,
  members
}) => {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isResidentDetailOpen, setIsResidentDetailOpen] = useState(false);

  if (!household) return null;

  const headOfHousehold = members.find(m => m.id === household.headOfHouseholdId);

  const handleMemberClick = (member: Resident) => {
    setSelectedResident(member);
    setIsResidentDetailOpen(true);
  };

  // Sort members: Head first, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === household.headOfHouseholdId) return -1;
    if (b.id === household.headOfHouseholdId) return 1;
    return 0;
  });

  const getRelationshipLabel = (memberId: string) => {
    if (memberId === household.headOfHouseholdId) return 'Chủ hộ';
    return household.relationships?.[memberId] || 'Thành viên';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Hộ gia đình"
    >
      <div className="space-y-6">
        {/* Household Info Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{household.name}</h3>
              <p className="text-sm text-slate-500">Mã hộ: {household.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-slate-900 block">Địa chỉ:</span>
                {household.address}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <Hash size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-slate-900 block">Tổ dân phố:</span>
                {household.unit || 'Chưa cập nhật'}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700 md:col-span-2">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-slate-900 block">Ngày tạo:</span>
                {new Date(household.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div>
          <h4 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Thành viên ({members.length})
          </h4>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Quan hệ</th>
                  <th className="px-4 py-3">Ngày sinh</th>
                  <th className="px-4 py-3">Liên hệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedMembers.map(member => {
                  const isHead = member.id === household.headOfHouseholdId;
                  return (
                    <tr key={member.id} className={isHead ? "bg-blue-50/30" : "hover:bg-slate-50"}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <button
                              onClick={() => handleMemberClick(member)}
                              className={`font-medium hover:underline cursor-pointer text-left ${isHead ? 'text-blue-700 hover:text-blue-800' : 'text-slate-900 hover:text-blue-600'}`}
                            >
                              {member.fullName}
                            </button>
                            {isHead && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-semibold leading-tight">
                                <Crown size={10} /> Chủ hộ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${isHead
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                          }`}>
                          {getRelationshipLabel(member.id)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(member.dob).getFullYear()} ({new Date().getFullYear() - new Date(member.dob).getFullYear()} tuổi)
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-slate-400" />
                          {member.phoneNumber}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Resident Detail Modal */}
      <ResidentDetailModal
        isOpen={isResidentDetailOpen}
        onClose={() => setIsResidentDetailOpen(false)}
        resident={selectedResident || undefined}
      />
    </Modal>
  );
};

export default HouseholdDetailModal;
