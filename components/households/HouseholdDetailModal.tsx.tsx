
import React, { useState } from 'react';
import { Home, MapPin, Calendar, User, Phone, Crown, Hash, Building2, FileText } from 'lucide-react';
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

    // Check if any business property fields have values
    const hasBusinessProperty = household.landPlotNumber || household.landMapSheetNumber ||
        household.certificateIssueNumber || household.certificateRegistryNumber ||
        household.businessArea || household.businessConstructionYear ||
        household.businessFloors || household.businessRooms || household.businessSector;

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

                {/* Business Information (if applicable) */}
                {household.isBusiness && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-3">
                        <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
                            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                <Building2 size={18} />
                            </div>
                            <h4 className="font-bold text-blue-900">Thông tin Kinh doanh</h4>
                            <span className="ml-auto px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                                HỘ KINH DOANH
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="flex items-start gap-2 text-sm">
                                <Building2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-semibold text-blue-900 block">Tên cơ sở:</span>
                                    <span className="text-slate-700">{household.businessName || 'Chưa cập nhật'}</span>
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <FileText size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-semibold text-blue-900 block">Số giấy phép:</span>
                                    <span className="text-slate-700">{household.businessLicenseNumber || 'Chưa cập nhật'}</span>
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <Calendar size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-semibold text-blue-900 block">Ngày cấp giấy phép:</span>
                                    <span className="text-slate-700">
                                        {household.businessLicenseDate
                                            ? new Date(household.businessLicenseDate).toLocaleDateString('vi-VN')
                                            : 'Chưa cập nhật'}
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <Crown size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-semibold text-blue-900 block">Chủ sở hữu:</span>
                                    {household.businessOwnerId ? (
                                        <span className="text-slate-700">
                                            {(() => {
                                                const owner = members.find(m => m.id === household.businessOwnerId);
                                                return owner ? (
                                                    <>
                                                        {owner.fullName}
                                                        {owner.phoneNumber && (
                                                            <span className="text-slate-500 ml-2">• {owner.phoneNumber}</span>
                                                        )}
                                                    </>
                                                ) : 'Chưa cập nhật';
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">Chưa cập nhật</span>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <User size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-semibold text-blue-900 block">Người quản lý:</span>
                                    {household.businessManagerId ? (
                                        <span className="text-slate-700">
                                            {(() => {
                                                const manager = members.find(m => m.id === household.businessManagerId);
                                                return manager ? (
                                                    <>
                                                        {manager.fullName}
                                                        {manager.phoneNumber && (
                                                            <span className="text-slate-500 ml-2">• {manager.phoneNumber}</span>
                                                        )}
                                                    </>
                                                ) : 'Chưa cập nhật';
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">Chưa cập nhật</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Business Property Information Section - Only show if at least one field has value */}
                {hasBusinessProperty && (
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <div className="p-1.5 bg-slate-600 text-white rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                            </div>
                            <h4 className="font-bold text-slate-900">Thông tin Bất động sản</h4>
                        </div>

                        {/* Land Certificate Info */}
                        {(household.landPlotNumber || household.landMapSheetNumber ||
                            household.certificateIssueNumber || household.certificateRegistryNumber) && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Giấy chứng nhận</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {household.landPlotNumber && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Thửa đất số:</span>
                                                <span className="text-slate-600">{household.landPlotNumber}</span>
                                            </div>
                                        )}
                                        {household.landMapSheetNumber && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Tờ bản đồ số:</span>
                                                <span className="text-slate-600">{household.landMapSheetNumber}</span>
                                            </div>
                                        )}
                                        {household.certificateIssueNumber && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Số phát hành GCN:</span>
                                                <span className="text-slate-600">{household.certificateIssueNumber}</span>
                                            </div>
                                        )}
                                        {household.certificateRegistryNumber && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Số vào sổ:</span>
                                                <span className="text-slate-600">{household.certificateRegistryNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Property Details */}
                        {(household.businessArea || household.businessConstructionYear ||
                            household.businessFloors || household.businessRooms || household.businessSector) && (
                                <div className="space-y-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Chi tiết Bất động sản</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {household.businessArea && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Diện tích:</span>
                                                <span className="text-slate-600">{household.businessArea} m²</span>
                                            </div>
                                        )}
                                        {household.businessConstructionYear && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Năm xây dựng:</span>
                                                <span className="text-slate-600">{household.businessConstructionYear}</span>
                                            </div>
                                        )}
                                        {household.businessFloors && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Số tầng:</span>
                                                <span className="text-slate-600">{household.businessFloors}</span>
                                            </div>
                                        )}
                                        {household.businessRooms && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Số phòng:</span>
                                                <span className="text-slate-600">{household.businessRooms}</span>
                                            </div>
                                        )}
                                        {household.businessSector && (
                                            <div className="col-span-2 flex items-start gap-2 text-sm">
                                                <span className="font-semibold text-slate-700">Ngành nghề:</span>
                                                <span className="text-slate-600">{household.businessSector}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Poor Household Information (if applicable) */}
                {household.isPoorHousehold && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 space-y-3">
                        <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                            <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                                    <path d="M12 3v6" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-amber-900">Hộ nghèo/cận nghèo</h4>
                            <span className="ml-auto px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded">
                                HỘ NGHÈO/CẬN NGHÈO
                            </span>
                        </div>

                        {household.poorHouseholdNotes && (
                            <div className="pt-1">
                                <p className="text-sm font-semibold text-amber-900 mb-1">Nội dung:</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-100">
                                    {household.poorHouseholdNotes}
                                </p>
                            </div>
                        )}

                        {!household.poorHouseholdNotes && (
                            <p className="text-sm text-amber-700 italic">Chưa có ghi chú</p>
                        )}
                    </div>
                )}

                {/* Policy Household Information (if applicable) */}
                {household.isPolicyHousehold && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 space-y-3">
                        <div className="flex items-center gap-2 border-b border-purple-200 pb-2">
                            <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-purple-900">Hộ chính sách</h4>
                            <span className="ml-auto px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                                HỘ CHÍNH SÁCH
                            </span>
                        </div>

                        {household.policyHouseholdNotes && (
                            <div className="pt-1">
                                <p className="text-sm font-semibold text-purple-900 mb-1">Nội dung:</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-purple-100">
                                    {household.policyHouseholdNotes}
                                </p>
                            </div>
                        )}

                        {!household.policyHouseholdNotes && (
                            <p className="text-sm text-purple-700 italic">Chưa có ghi chú</p>
                        )}
                    </div>
                )}

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
