import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, UserPlus, Download, Shield, Heart, Zap, Activity, Star, Trash2, Eye, EyeOff, Flag } from 'lucide-react';
import type { Association, AssociationMember, AssociationType, AssociationRole, Resident } from '../../../types';
import AddMemberModal from '../../../components/associations/AddMemberModal';
import ResidentDetailModal from '../../../components/residents/ResidentDetailModal';

// Import API functions
import {
    getAssociations,
    getAssociationMembers,
    addAssociationMember,
    addMilitaryInfo,
    addPartyMemberInfo,
    updateMemberRole,
    removeMemberFromAssociation,
} from '../../../utils/mockApi';

// Association icons and colors
const ASSOCIATION_CONFIG: Record<AssociationType, { icon: any; color: string; bgColor: string }> = {
    veterans: { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
    women: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    youth: { icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    red_cross: { icon: Activity, color: 'text-red-500', bgColor: 'bg-red-50' },
    discharged_military: { icon: Star, color: 'text-green-600', bgColor: 'bg-green-50' },
    party_member_213: { icon: Flag, color: 'text-red-700', bgColor: 'bg-red-50' },
};

const AssociationsPage: React.FC = () => {
    const [associations, setAssociations] = useState<Association[]>([]);
    const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
    const [members, setMembers] = useState<AssociationMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [isResidentDetailOpen, setIsResidentDetailOpen] = useState(false);
    const [showMilitaryInfo, setShowMilitaryInfo] = useState<Record<string, boolean>>({});
    const [showPartyMemberInfo, setShowPartyMemberInfo] = useState<Record<string, boolean>>({});

    // Memoize existingMemberIds to prevent infinite loop and improve performance
    const existingMemberIds = useMemo(() => members.map((m) => m.residentId), [members]);

    // Fetch associations on mount
    useEffect(() => {
        loadAssociations();
    }, []);

    // Load members when association is selected
    useEffect(() => {
        if (selectedAssociation) {
            loadMembers(selectedAssociation.id);
        }
    }, [selectedAssociation]);

    const loadAssociations = async () => {
        try {
            setIsLoading(true);
            const data = await getAssociations();
            setAssociations(data);
            if (data.length > 0 && !selectedAssociation) {
                setSelectedAssociation(data[0]);
            }
        } catch (error) {
            console.error('Failed to load associations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMembers = useCallback(async (associationId: string) => {
        try {
            const data = await getAssociationMembers(associationId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to load members:', error);
        }
    }, []);

    const handleAddMember = async (residentId: string, role: AssociationRole, militaryInfo?: any, partyMemberInfo?: any) => {
        if (!selectedAssociation) return;

        try {
            // Add member to association
            const newMember = await addAssociationMember(selectedAssociation.id, residentId, role);

            // If military info provided and it's discharged_military association, save it
            if (militaryInfo && selectedAssociation.type === 'discharged_military' && newMember) {
                await addMilitaryInfo(newMember.id, militaryInfo);
            }

            // If party member info provided and it's party_member_213 association, save it
            if (partyMemberInfo && selectedAssociation.type === 'party_member_213' && newMember) {
                await addPartyMemberInfo(newMember.id, partyMemberInfo);
            }

            // Optimize: Only reload members if we need full data, otherwise just add to list
            // For now, we'll reload to get the full member object with resident details
            // But we can optimize this further by constructing the member object locally
            await loadMembers(selectedAssociation.id);
        } catch (error) {
            console.error('Failed to add member:', error);
            throw error;
        }
    };

    const handleDeleteMember = async (memberId: string, memberName: string) => {
        if (!selectedAssociation) return;

        if (!confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi ${selectedAssociation.name}?`)) {
            return;
        }

        try {
            await removeMemberFromAssociation(memberId);
            await loadMembers(selectedAssociation.id);
        } catch (error) {
            console.error('Failed to delete member:', error);
            alert('Không thể xóa thành viên. Vui lòng thử lại.');
        }
    };

    const handleExportExcel = () => {
        // TODO: Implement Excel export
        alert('Tính năng xuất Excel đang được phát triển');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-600" />
                            Quản lý Chi Hội
                        </h1>
                        <p className="text-gray-600 mt-1">Quản lý các tổ chức đoàn thể khu phố</p>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Association Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-6 divide-x divide-gray-200">
                    {associations.map((association) => {
                        const config = ASSOCIATION_CONFIG[association.type];
                        const Icon = config.icon;
                        const isActive = selectedAssociation?.id === association.id;
                        const memberCount = isActive ? members.length : 0;

                        return (
                            <button
                                key={association.id}
                                onClick={() => setSelectedAssociation(association)}
                                className={`p-4 text-left transition-all ${isActive
                                    ? `${config.bgColor} border-b-4 border-blue-600`
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${config.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{association.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {isActive ? memberCount : '—'} thành viên
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Members Section */}
            {selectedAssociation && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedAssociation.name}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Tổng số: <span className="font-semibold">{members.length}</span> thành viên
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UserPlus className="h-5 w-5" />
                                Thêm thành viên
                            </button>
                        </div>
                    </div>

                    {/* Member List */}
                    <div className="p-6">
                        {members.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Chưa có thành viên nào</p>
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Thêm thành viên đầu tiên
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member) => {
                                    const resident = member.resident;
                                    if (!resident) return null;

                                    const roleLabels = {
                                        president: 'Chi hội trưởng',
                                        vice_president: 'Chi hội phó',
                                        member: 'Hội viên',
                                    };

                                    const roleBadgeColors = {
                                        president: 'bg-red-100 text-red-800 border-red-300',
                                        vice_president: 'bg-orange-100 text-orange-800 border-orange-300',
                                        member: 'bg-blue-100 text-blue-800 border-blue-300',
                                    };

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {/* Avatar */}
                                            <img
                                                src={resident.avatar}
                                                alt={resident.fullName}
                                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${resident.fullName}&background=random`;
                                                }}
                                            />

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3
                                                        onClick={() => {
                                                            setSelectedResident(resident);
                                                            setIsResidentDetailOpen(true);
                                                        }}
                                                        className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                                    >
                                                        {resident.fullName}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadgeColors[member.role]
                                                            }`}
                                                    >
                                                        {roleLabels[member.role]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {new Date().getFullYear() - new Date(resident.dob).getFullYear()} tuổi •{' '}
                                                    {resident.phoneNumber}
                                                </p>

                                                {/* Military Info Details (when expanded) */}
                                                {selectedAssociation?.type === 'discharged_military' && member.militaryInfo && showMilitaryInfo[member.id] && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                                                            {member.militaryInfo.rank && (
                                                                <div>
                                                                    <span className="font-medium">Cấp bậc:</span> {member.militaryInfo.rank}
                                                                </div>
                                                            )}
                                                            {member.militaryInfo.position && (
                                                                <div>
                                                                    <span className="font-medium">Chức vụ:</span> {member.militaryInfo.position}
                                                                </div>
                                                            )}
                                                            {member.militaryInfo.enlistmentDate && (
                                                                <div>
                                                                    <span className="font-medium">Nhập ngũ:</span>{' '}
                                                                    {new Date(member.militaryInfo.enlistmentDate).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            )}
                                                            {member.militaryInfo.dischargeDate && (
                                                                <div>
                                                                    <span className="font-medium">Xuất ngũ:</span>{' '}
                                                                    {new Date(member.militaryInfo.dischargeDate).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            )}
                                                            {member.militaryInfo.militarySpecialty && (
                                                                <div className="col-span-2">
                                                                    <span className="font-medium">Chuyên nghiệp:</span> {member.militaryInfo.militarySpecialty}
                                                                </div>
                                                            )}
                                                            {member.militaryInfo.lastUnit && (
                                                                <div className="col-span-2">
                                                                    <span className="font-medium">Đơn vị xuất ngũ:</span> {member.militaryInfo.lastUnit}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Party Member Info for party_member_213 association */}
                                                {selectedAssociation?.type === 'party_member_213' && member.partyMemberInfo && showPartyMemberInfo[member.id] && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <div className="space-y-2 text-xs text-gray-700">
                                                            {member.partyMemberInfo.workplace && (
                                                                <div>
                                                                    <span className="font-medium">Đơn vị công tác:</span> {member.partyMemberInfo.workplace}
                                                                </div>
                                                            )}
                                                            {/* Date fields in horizontal row */}
                                                            {(member.partyMemberInfo.introductionDate || member.partyMemberInfo.partyJoinDate || member.partyMemberInfo.officialDate) && (
                                                                <div className="flex items-center gap-4">
                                                                    {member.partyMemberInfo.introductionDate && (
                                                                        <div>
                                                                            <span className="font-medium">Ngày giới thiệu:</span>{' '}
                                                                            {new Date(member.partyMemberInfo.introductionDate).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                    {member.partyMemberInfo.partyJoinDate && (
                                                                        <div>
                                                                            <span className="font-medium">Ngày vào đảng:</span>{' '}
                                                                            {new Date(member.partyMemberInfo.partyJoinDate).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                    {member.partyMemberInfo.officialDate && (
                                                                        <div>
                                                                            <span className="font-medium">Ngày chính thức:</span>{' '}
                                                                            {new Date(member.partyMemberInfo.officialDate).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {member.partyMemberInfo.partyActivities && (
                                                                <div>
                                                                    <span className="font-medium">Sinh hoạt đảng:</span> {member.partyMemberInfo.partyActivities}
                                                                </div>
                                                            )}
                                                            {member.partyMemberInfo.partyNotes && (
                                                                <div>
                                                                    <span className="font-medium">Nhận xét:</span> {member.partyMemberInfo.partyNotes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm text-gray-500">
                                                    Tham gia: {new Date(member.joinedDate).toLocaleDateString('vi-VN')}
                                                </div>

                                                {/* Military Info Toggle Button */}
                                                {selectedAssociation?.type === 'discharged_military' && member.militaryInfo && (
                                                    <button
                                                        onClick={() => setShowMilitaryInfo(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={showMilitaryInfo[member.id] ? "Ẩn thông tin quân sự" : "Xem thông tin quân sự"}
                                                    >
                                                        {showMilitaryInfo[member.id] ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                )}

                                                {/* Party Member Info Toggle Button */}
                                                {selectedAssociation?.type === 'party_member_213' && member.partyMemberInfo && (
                                                    <button
                                                        onClick={() => setShowPartyMemberInfo(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={showPartyMemberInfo[member.id] ? "Ẩn thông tin đảng viên" : "Xem thông tin đảng viên"}
                                                    >
                                                        {showPartyMemberInfo[member.id] ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteMember(member.id, resident.fullName)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa khỏi hội"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onAdd={handleAddMember}
                existingMemberIds={existingMemberIds}
                associationName={selectedAssociation?.name || ''}
                associationType={selectedAssociation?.type}
            />

            {/* Resident Detail Modal */}
            <ResidentDetailModal
                isOpen={isResidentDetailOpen}
                onClose={() => {
                    setIsResidentDetailOpen(false);
                    setSelectedResident(null);
                }}
                resident={selectedResident}
            />
        </div >
    );
};

export default AssociationsPage;
