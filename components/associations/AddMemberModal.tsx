import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import type { Resident, AssociationRole, AssociationType } from '../../types';
import { getAllResidents } from '../../utils/mockApi';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (residentId: string, role: AssociationRole, militaryInfo?: any) => Promise<void>;
    existingMemberIds: string[];
    associationName: string;
    associationType?: AssociationType;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    existingMemberIds,
    associationName,
    associationType,
}) => {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedRole, setSelectedRole] = useState<AssociationRole>('member');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Military info state (for discharged_military association)
    const [militaryInfo, setMilitaryInfo] = useState({
        enlistmentDate: '',
        dischargeDate: '',
        rank: '',
        position: '',
        militarySpecialty: '',
        lastUnit: '',
    });

    // Party member info state (for party_member_213 association)
    const [partyMemberInfo, setPartyMemberInfo] = useState({
        workplace: '',
        introductionDate: '',
        partyJoinDate: '',
        officialDate: '',
        partyActivities: '',
        partyNotes: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadResidents();
        }
    }, [isOpen]);

    useEffect(() => {
        // Filter residents based on search query and exclude existing members
        const filtered = residents.filter(
            (r) =>
                !existingMemberIds.includes(r.id) &&
                (r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.phoneNumber?.includes(searchQuery))
        );
        setFilteredResidents(filtered);

        // Debug logging
        if (searchQuery) {
            console.log('Search query:', searchQuery);
            console.log('Total residents loaded:', residents.length);
            console.log('Existing member IDs:', existingMemberIds);
            console.log('Filtered results:', filtered.length);
        }
    }, [searchQuery, residents, existingMemberIds]);

    const loadResidents = async () => {
        try {
            setIsLoading(true);
            // Use getAllResidents to fetch ALL residents without any filters
            const allResidents = await getAllResidents();
            setResidents(allResidents);
            console.log('Loaded ALL residents:', allResidents.length);
            console.log('Sample resident:', allResidents[0]);
        } catch (error) {
            console.error('Failed to load residents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedResident) return;

        try {
            setIsSubmitting(true);
            // Pass military info only if it's discharged_military association and has data
            const militaryData = associationType === 'discharged_military' && (
                militaryInfo.enlistmentDate || militaryInfo.dischargeDate ||
                militaryInfo.rank || militaryInfo.position ||
                militaryInfo.militarySpecialty || militaryInfo.lastUnit
            ) ? militaryInfo : undefined;

            // Pass party member info only if it's party_member_213 association and has data
            const partyData = associationType === 'party_member_213' && (
                partyMemberInfo.workplace || partyMemberInfo.introductionDate ||
                partyMemberInfo.partyJoinDate || partyMemberInfo.officialDate ||
                partyMemberInfo.partyActivities || partyMemberInfo.partyNotes
            ) ? partyMemberInfo : undefined;

            await onAdd(selectedResident.id, selectedRole, militaryData, partyData);
            onClose();
            setSelectedResident(null);
            setSearchQuery('');
            setSelectedRole('member');
            setMilitaryInfo({
                enlistmentDate: '',
                dischargeDate: '',
                rank: '',
                position: '',
                militarySpecialty: '',
                lastUnit: '',
            });
            setPartyMemberInfo({
                workplace: '',
                introductionDate: '',
                partyJoinDate: '',
                officialDate: '',
                partyActivities: '',
                partyNotes: '',
            });
        } catch (error) {
            console.error('Failed to add member:', error);
            alert('Không thể thêm thành viên. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Thêm thành viên</h2>
                        <p className="text-sm text-gray-600 mt-1">{associationName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cư dân (tên, số điện thoại)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Resident List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Đang tải...</p>
                        </div>
                    ) : filteredResidents.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {searchQuery
                                    ? 'Không tìm thấy cư dân phù hợp'
                                    : 'Tất cả cư dân đã tham gia hội này'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredResidents.map((resident) => (
                                <button
                                    key={resident.id}
                                    onClick={() => setSelectedResident(resident)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedResident?.id === resident.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <img
                                        src={resident.avatar}
                                        alt={resident.fullName}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${resident.fullName}&background=random`;
                                        }}
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900">{resident.fullName}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date().getFullYear() - new Date(resident.dob).getFullYear()} tuổi •{' '}
                                            {resident.phoneNumber}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedResident && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai trò trong hội
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as AssociationRole)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="member">Hội viên</option>
                                <option value="vice_president">Chi hội phó</option>
                                <option value="president">Chi hội trưởng</option>
                            </select>
                        </div>

                        {/* Military Info Fields (only for discharged_military association) */}
                        {associationType === 'discharged_military' && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin quân sự (không bắt buộc)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Cấp bậc</label>
                                        <input
                                            type="text"
                                            value={militaryInfo.rank}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, rank: e.target.value })}
                                            placeholder="VD: Trung sĩ"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Chức vụ</label>
                                        <input
                                            type="text"
                                            value={militaryInfo.position}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, position: e.target.value })}
                                            placeholder="VD: Tiểu đội trưởng"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày nhập ngũ</label>
                                        <input
                                            type="date"
                                            value={militaryInfo.enlistmentDate}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, enlistmentDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày xuất ngũ</label>
                                        <input
                                            type="date"
                                            value={militaryInfo.dischargeDate}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, dischargeDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Chuyên nghiệp quân sự</label>
                                        <input
                                            type="text"
                                            value={militaryInfo.militarySpecialty}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, militarySpecialty: e.target.value })}
                                            placeholder="VD: Bộ binh, Pháo binh, Thông tin..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị trước khi xuất ngũ</label>
                                        <input
                                            type="text"
                                            value={militaryInfo.lastUnit}
                                            onChange={(e) => setMilitaryInfo({ ...militaryInfo, lastUnit: e.target.value })}
                                            placeholder="VD: Trung đoàn 5, Sư đoàn 3"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Party Member Info Form (for party_member_213 association) */}
                        {associationType === 'party_member_213' && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin đảng viên (tùy chọn)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị nơi công tác</label>
                                        <input
                                            type="text"
                                            value={partyMemberInfo.workplace}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, workplace: e.target.value })}
                                            placeholder="VD: Công ty TNHH ABC, Phòng GD&ĐT..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày giới thiệu</label>
                                        <input
                                            type="date"
                                            value={partyMemberInfo.introductionDate}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, introductionDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày vào đảng</label>
                                        <input
                                            type="date"
                                            value={partyMemberInfo.partyJoinDate}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, partyJoinDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày chính thức</label>
                                        <input
                                            type="date"
                                            value={partyMemberInfo.officialDate}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, officialDate: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Sinh hoạt tại chi, Đảng bộ nơi cư trú</label>
                                        <textarea
                                            value={partyMemberInfo.partyActivities}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, partyActivities: e.target.value })}
                                            placeholder="Mô tả hoạt động sinh hoạt đảng..."
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Nhận xét của chi, đảng bộ nơi cư trú</label>
                                        <textarea
                                            value={partyMemberInfo.partyNotes}
                                            onChange={(e) => setPartyMemberInfo({ ...partyMemberInfo, partyNotes: e.target.value })}
                                            placeholder="Nhận xét, đánh giá..."
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        Thêm vào hội
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMemberModal;
