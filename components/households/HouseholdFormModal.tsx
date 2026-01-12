
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, X, User, Building2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import SearchableSelect from '../ui/SearchableSelect';
import { Household, Resident } from '../../types';
import { createHousehold, updateHousehold } from '../../utils/api/households';

// Schema with conditional business validation
const householdSchema = z.object({
    headOfHouseholdId: z.string().min(1, "Vui lòng chọn chủ hộ"),
    unit: z.string().min(1, "Vui lòng nhập tổ dân phố"),
    isBusiness: z.boolean().optional(),
    businessName: z.string().optional(),
    businessLicenseNumber: z.string().optional(),
    businessLicenseDate: z.string().optional(),
    businessOwnerId: z.string().optional(),
    businessManagerId: z.string().optional(),
    // Land certificate fields
    landPlotNumber: z.string().optional(),
    landMapSheetNumber: z.string().optional(),
    certificateIssueNumber: z.string().optional(),
    certificateRegistryNumber: z.string().optional(),
    // Property details
    businessArea: z.number().optional(),
    businessConstructionYear: z.number().optional(),
    businessFloors: z.number().optional(),
    businessRooms: z.number().optional(),
    businessSector: z.string().optional(),
    // Household types
    isPoorHousehold: z.boolean().optional(),
    poorHouseholdNotes: z.string().optional(),
    isPolicyHousehold: z.boolean().optional(),
    policyHouseholdNotes: z.string().optional(),
}).refine((data) => {
    // If business, require business fields
    if (data.isBusiness) {
        return !!(data.businessName && data.businessLicenseNumber && data.businessLicenseDate);
    }
    return true;
}, {
    message: "Vui lòng điền đầy đủ thông tin kinh doanh",
    path: ["businessName"],
});

type HouseholdFormData = z.infer<typeof householdSchema> & {
    memberIds: string[];
    relationships: Record<string, string>;
};

interface HouseholdFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableResidents: Resident[];
    initialData?: Household | null;
}

const RELATIONSHIP_OPTIONS = [
    "Vợ", "Chồng", "Con",
    "Cha", "Mẹ",
    "Ông nội", "Bà nội", "Ông ngoại", "Bà ngoại",
    "Anh", "Chị", "Em",
    "Cháu",
    "Cô", "Dì", "Chú", "Bác", "Cậu", "Mợ"
];

const HouseholdFormModal: React.FC<HouseholdFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    availableResidents,
    initialData
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<Record<string, string>>({});
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [formError, setFormError] = useState<string>('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<HouseholdFormData>({
        resolver: zodResolver(householdSchema),
        defaultValues: {
            headOfHouseholdId: '',
            unit: '',
            isBusiness: false,
            businessName: '',
            businessLicenseNumber: '',
            businessLicenseDate: '',
            businessOwnerId: '',
            businessManagerId: '',
            // Land certificate fields
            landPlotNumber: '',
            landMapSheetNumber: '',
            certificateIssueNumber: '',
            certificateRegistryNumber: '',
            // Property details
            businessArea: undefined,
            businessConstructionYear: undefined,
            businessFloors: undefined,
            businessRooms: undefined,
            businessSector: '',
            isPoorHousehold: false,
            poorHouseholdNotes: '',
            isPolicyHousehold: false,
            policyHouseholdNotes: '',
        }
    });

    const headOfHouseholdId = watch('headOfHouseholdId');
    const isBusiness = watch('isBusiness');
    const isPoorHousehold = watch('isPoorHousehold');
    const isPolicyHousehold = watch('isPolicyHousehold');

    // Reset/Init form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    headOfHouseholdId: initialData.headOfHouseholdId,
                    unit: initialData.unit,
                    isBusiness: initialData.isBusiness || false,
                    businessName: initialData.businessName || '',
                    businessLicenseNumber: initialData.businessLicenseNumber || '',
                    businessLicenseDate: initialData.businessLicenseDate || '',
                    businessOwnerId: initialData.businessOwnerId || '',
                    businessManagerId: initialData.businessManagerId || '',
                    // Land certificate fields
                    landPlotNumber: initialData.landPlotNumber || '',
                    landMapSheetNumber: initialData.landMapSheetNumber || '',
                    certificateIssueNumber: initialData.certificateIssueNumber || '',
                    certificateRegistryNumber: initialData.certificateRegistryNumber || '',
                    // Property details
                    businessArea: initialData.businessArea,
                    businessConstructionYear: initialData.businessConstructionYear,
                    businessFloors: initialData.businessFloors,
                    businessRooms: initialData.businessRooms,
                    businessSector: initialData.businessSector || '',
                    isPoorHousehold: initialData.isPoorHousehold || false,
                    poorHouseholdNotes: initialData.poorHouseholdNotes || '',
                    isPolicyHousehold: initialData.isPolicyHousehold || false,
                    policyHouseholdNotes: initialData.policyHouseholdNotes || '',
                });
                setSelectedMembers(initialData.memberIds);
                setRelationships(initialData.relationships || {});
            } else {
                reset({
                    headOfHouseholdId: '',
                    unit: '',
                    isBusiness: false,
                    businessName: '',
                    businessLicenseNumber: '',
                    businessLicenseDate: '',
                    businessOwnerId: '',
                    businessManagerId: '',
                    // Land certificate fields
                    landPlotNumber: '',
                    landMapSheetNumber: '',
                    certificateIssueNumber: '',
                    certificateRegistryNumber: '',
                    // Property details
                    businessArea: undefined,
                    businessConstructionYear: undefined,
                    businessFloors: undefined,
                    businessRooms: undefined,
                    businessSector: '',
                    isPoorHousehold: false,
                    poorHouseholdNotes: '',
                    isPolicyHousehold: false,
                    policyHouseholdNotes: '',
                });
                setSelectedMembers([]);
                setRelationships({});
                setMemberSearchQuery('');
            }
        }
    }, [isOpen, initialData, reset]);


    // Derived Values
    const selectedHead = availableResidents.find(r => r.id === headOfHouseholdId);
    const potentialMembers = availableResidents;

    const toggleMember = (id: string) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(prev => prev.filter(m => m !== id));
            const newRels = { ...relationships };
            delete newRels[id];
            setRelationships(newRels);
            if (id === headOfHouseholdId) {
                setValue('headOfHouseholdId', '');
            }
        } else {
            setSelectedMembers(prev => {
                const newMembers = [...prev, id];
                // Auto-select as head if this is the only member
                if (newMembers.length === 1) {
                    setValue('headOfHouseholdId', id, { shouldValidate: true });
                }
                return newMembers;
            });
        }
        // Clear any previous errors when user interacts
        setFormError('');
    };

    const handleRelationshipChange = (id: string, value: string) => {
        setRelationships(prev => ({ ...prev, [id]: value }));
    };

    const onSubmit = async (data: HouseholdFormData) => {
        // Clear previous errors
        setFormError('');

        // Validate head of household (only if there are members)
        if (selectedMembers.length > 0 && !selectedHead) {
            setFormError('Vui lòng chọn chủ hộ từ danh sách thành viên.');
            return;
        }

        // Warn about 0-member households but allow save (Option A)
        if (selectedMembers.length === 0) {
            // Allow save but show warning - user can add members later
            console.warn('Creating/updating household with 0 members');
        }

        // Validate business fields if business household
        if (data.isBusiness) {
            if (!data.businessName || !data.businessLicenseNumber || !data.businessLicenseDate) {
                setFormError('Vui lòng điền đầy đủ thông tin kinh doanh (Tên cơ sở, Số giấy phép, Ngày cấp).');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Remove head from relationships (head should not have a relationship)
            const cleanRelationships = { ...relationships };
            delete cleanRelationships[data.headOfHouseholdId];

            const payload: any = {
                name: selectedHead ? `Hộ ${selectedHead.fullName}` : (initialData?.name || 'Hộ chưa có tên'),
                address: selectedHead?.address || initialData?.address || 'Chưa cập nhật',
                unit: data.unit,
                headOfHouseholdId: data.headOfHouseholdId || null, // Allow null for 0-member households
                memberIds: selectedMembers,
                relationships: cleanRelationships,
                isBusiness: data.isBusiness || false,
            };

            // Add business fields if this is a business household
            if (data.isBusiness) {
                payload.businessName = data.businessName;
                payload.businessLicenseNumber = data.businessLicenseNumber;
                payload.businessLicenseDate = data.businessLicenseDate;
                payload.businessOwnerId = data.businessOwnerId || data.headOfHouseholdId;
                payload.businessManagerId = data.businessManagerId;
            }

            // Always send land certificate and property fields
            payload.landPlotNumber = data.landPlotNumber || null;
            payload.landMapSheetNumber = data.landMapSheetNumber || null;
            payload.certificateIssueNumber = data.certificateIssueNumber || null;
            payload.certificateRegistryNumber = data.certificateRegistryNumber || null;
            payload.businessArea = data.businessArea || null;
            payload.businessConstructionYear = data.businessConstructionYear || null;
            payload.businessFloors = data.businessFloors || null;
            payload.businessRooms = data.businessRooms || null;
            payload.businessSector = data.businessSector || null;

            // Add poor household fields if this is a poor household
            payload.isPoorHousehold = data.isPoorHousehold || false;
            if (data.isPoorHousehold) {
                payload.poorHouseholdNotes = data.poorHouseholdNotes;
            }

            // Add policy household fields if this is a policy household
            payload.isPolicyHousehold = data.isPolicyHousehold || false;
            if (data.isPolicyHousehold) {
                payload.policyHouseholdNotes = data.policyHouseholdNotes;
            }

            if (initialData) {
                await updateHousehold(initialData.id, payload);
            } else {
                await createHousehold(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            setFormError('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Chỉnh sửa Hộ gia đình" : "Tạo Hộ gia đình Mới"}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Step 1: Basic Info */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">1. Thông tin cơ bản</h4>

                    <Input
                        label="Tổ dân phố *"
                        {...register('unit')}
                        error={errors.unit?.message}
                        placeholder="Nhập số tổ..."
                    />

                    {/* Business Household Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="isBusiness"
                            {...register('isBusiness')}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="isBusiness" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <Building2 size={18} className="text-blue-600" />
                            Hộ kinh doanh
                        </label>
                    </div>

                    {/* Poor Household Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <input
                            type="checkbox"
                            id="isPoorHousehold"
                            {...register('isPoorHousehold')}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="isPoorHousehold" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                                <path d="M12 3v6" />
                            </svg>
                            Hộ nghèo/cận nghèo
                        </label>
                    </div>

                    {/* Policy Household Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <input
                            type="checkbox"
                            id="isPolicyHousehold"
                            {...register('isPolicyHousehold')}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <label htmlFor="isPolicyHousehold" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            Hộ chính sách
                        </label>
                    </div>
                </div>

                {/* Policy Household Notes (Conditional) */}
                {isPolicyHousehold && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            Thông tin hộ chính sách
                        </h4>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nội dung (ghi chú)
                            </label>
                            <textarea
                                {...register('policyHouseholdNotes')}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Nhập thông tin về chính sách áp dụng cho hộ gia đình..."
                            />
                        </div>
                    </div>
                )}

                {/* Poor Household Notes (Conditional) */}
                {isPoorHousehold && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                                <path d="M12 3v6" />
                            </svg>
                            Thông tin hộ nghèo/cận nghèo
                        </h4>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nội dung (ghi chú)
                            </label>
                            <textarea
                                {...register('poorHouseholdNotes')}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                placeholder="Nhập thông tin về tình trạng hộ nghèo/cận nghèo, lý do, thời gian được xác định..."
                            />
                        </div>
                    </div>
                )}

                {/* Step 1.5: Business Information (Conditional) */}
                {isBusiness && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Building2 size={18} className="text-blue-600" />
                            Thông tin kinh doanh
                        </h4>

                        <Input
                            label="Tên cơ sở kinh doanh (theo giấy phép kinh doanh) *"
                            {...register('businessName')}
                            error={errors.businessName?.message}
                            placeholder="Nhập tên cơ sở kinh doanh..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Số Giấy phép kinh doanh *"
                                {...register('businessLicenseNumber')}
                                error={errors.businessLicenseNumber?.message}
                                placeholder="Số giấy phép..."
                            />

                            <Input
                                label="Ngày cấp Giấy phép *"
                                type="date"
                                {...register('businessLicenseDate')}
                                error={errors.businessLicenseDate?.message}
                            />
                        </div>

                        {selectedMembers.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Chủ sở hữu
                                    </label>
                                    <select
                                        {...register('businessOwnerId')}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn chủ sở hữu --</option>
                                        {/* Include head of household */}
                                        {headOfHouseholdId && (() => {
                                            const head = availableResidents.find(r => r.id === headOfHouseholdId);
                                            if (head) {
                                                return (
                                                    <option key={head.id} value={head.id}>
                                                        {head.fullName} (Chủ hộ)
                                                    </option>
                                                );
                                            }
                                            return null;
                                        })()}
                                        {/* Include other members */}
                                        {selectedMembers
                                            .filter(memberId => memberId !== headOfHouseholdId)
                                            .map(memberId => {
                                                const member = availableResidents.find(r => r.id === memberId);
                                                if (!member) return null;
                                                return (
                                                    <option key={memberId} value={memberId}>
                                                        {member.fullName}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Người quản lý
                                    </label>
                                    <select
                                        {...register('businessManagerId')}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn người quản lý --</option>
                                        {/* Include head of household */}
                                        {headOfHouseholdId && (() => {
                                            const head = availableResidents.find(r => r.id === headOfHouseholdId);
                                            if (head) {
                                                return (
                                                    <option key={head.id} value={head.id}>
                                                        {head.fullName} (Chủ hộ)
                                                    </option>
                                                );
                                            }
                                            return null;
                                        })()}
                                        {/* Include other members */}
                                        {selectedMembers
                                            .filter(memberId => memberId !== headOfHouseholdId)
                                            .map(memberId => {
                                                const member = availableResidents.find(r => r.id === memberId);
                                                if (!member) return null;
                                                return (
                                                    <option key={memberId} value={memberId}>
                                                        {member.fullName}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Business Property Information Section */}
                        <div className="space-y-4 border-t border-slate-200 pt-4 mt-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                                Thông tin Bất động sản
                            </h4>

                            {/* Land Certificate Information */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                <p className="text-sm font-medium text-slate-700">Thông tin Giấy chứng nhận</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Thửa đất số"
                                        {...register('landPlotNumber')}
                                        placeholder="Ví dụ: 123"
                                    />

                                    <Input
                                        label="Tờ bản đồ số"
                                        {...register('landMapSheetNumber')}
                                        placeholder="Ví dụ: 45"
                                    />

                                    <Input
                                        label="Số phát hành GCN"
                                        {...register('certificateIssueNumber')}
                                        placeholder="Nhập số phát hành..."
                                    />

                                    <Input
                                        label="Số vào sổ cấp giấy"
                                        {...register('certificateRegistryNumber')}
                                        placeholder="Nhập số vào sổ..."
                                    />
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                <p className="text-sm font-medium text-slate-700">Chi tiết Bất động sản</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Diện tích (m²)"
                                        type="number"
                                        {...register('businessArea', { valueAsNumber: true })}
                                        placeholder="Nhập diện tích..."
                                    />

                                    <Input
                                        label="Năm xây dựng"
                                        type="number"
                                        {...register('businessConstructionYear', { valueAsNumber: true })}
                                        placeholder="Ví dụ: 2020"
                                    />

                                    <Input
                                        label="Số tầng"
                                        type="number"
                                        {...register('businessFloors', { valueAsNumber: true })}
                                        placeholder="Nhập số tầng..."
                                    />

                                    <Input
                                        label="Số phòng"
                                        type="number"
                                        {...register('businessRooms', { valueAsNumber: true })}
                                        placeholder="Nhập số phòng..."
                                    />
                                </div>

                                <Input
                                    label="Ngành nghề kinh doanh"
                                    {...register('businessSector')}
                                    placeholder="Ví dụ: Kinh doanh nhà trọ, Cửa hàng tạp hóa..."
                                />
                            </div>
                        </div>

                        {selectedMembers.length === 0 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <p>💡 Vui lòng chọn thành viên hộ gia đình trước để chọn chủ sở hữu và người quản lý.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Select Members */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
                        <span>2. Chọn Thành viên</span>
                        <span className="text-xs font-normal text-slate-500">{selectedMembers.length} đã chọn</span>
                    </h4>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thành viên theo tên..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {memberSearchQuery && (
                            <button
                                type="button"
                                onClick={() => setMemberSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {(() => {
                            // Only show results if user has entered a search query
                            if (!memberSearchQuery.trim()) {
                                return (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        Nhập tên để tìm kiếm thành viên...
                                    </div>
                                );
                            }

                            const filteredMembers = potentialMembers
                                .filter(resident =>
                                    resident.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                )
                                .slice(0, 50); // Limit to 50 results for performance

                            if (filteredMembers.length === 0) {
                                return (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        Không tìm thấy thành viên nào phù hợp với "{memberSearchQuery}"
                                    </div>
                                );
                            }

                            return filteredMembers.map(resident => (
                                <div key={resident.id} className="p-3 flex items-start justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(resident.id)}
                                            onChange={() => toggleMember(resident.id)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-900">{resident.fullName}</p>
                                            <p className="text-slate-500 text-xs">{new Date().getFullYear() - new Date(resident.dob).getFullYear()} tuổi</p>
                                        </div>
                                    </div>

                                    {selectedMembers.includes(resident.id) && resident.id !== headOfHouseholdId && (
                                        <div className="flex flex-col gap-1 items-end">
                                            <select
                                                className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-32"
                                                value={
                                                    (relationships[resident.id] && !RELATIONSHIP_OPTIONS.includes(relationships[resident.id]))
                                                        ? 'OTHER'
                                                        : (relationships[resident.id] || '')
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'OTHER') {
                                                        handleRelationshipChange(resident.id, ' ');
                                                    } else {
                                                        handleRelationshipChange(resident.id, val);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">-- Quan hệ --</option>
                                                {RELATIONSHIP_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                                <option value="OTHER">Khác (Nhập tay)</option>
                                            </select>

                                            {(relationships[resident.id] && !RELATIONSHIP_OPTIONS.includes(relationships[resident.id])) && (
                                                <input
                                                    type="text"
                                                    className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-32 animate-in fade-in slide-in-from-top-1"
                                                    placeholder="Nhập quan hệ..."
                                                    value={relationships[resident.id] === ' ' ? '' : relationships[resident.id]}
                                                    onChange={(e) => handleRelationshipChange(resident.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Step 3: Select Head from Members */}
                {selectedMembers.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">3. Chọn Chủ hộ</h4>

                        <div className="space-y-2">
                            {selectedMembers.map(memberId => {
                                const member = availableResidents.find(r => r.id === memberId);
                                if (!member) return null;

                                return (
                                    <div
                                        key={memberId}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${headOfHouseholdId === memberId
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setValue('headOfHouseholdId', memberId, { shouldValidate: true })}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                checked={headOfHouseholdId === memberId}
                                                onChange={() => setValue('headOfHouseholdId', memberId, { shouldValidate: true })}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{member.fullName}</p>
                                                <p className="text-xs text-slate-500">{member.address}</p>
                                            </div>
                                            {headOfHouseholdId === memberId && (
                                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                    Chủ hộ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {errors.headOfHouseholdId && (
                            <p className="text-sm text-red-600">{errors.headOfHouseholdId.message}</p>
                        )}

                        {selectedHead && (
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                                <p><strong>Địa chỉ hộ:</strong> {selectedHead.address}</p>
                                <p>Hệ thống sẽ tự động lấy địa chỉ của chủ hộ làm địa chỉ chung cho hộ gia đình.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message Display */}
                {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{formError}</span>
                    </div>
                )}

                {/* Warning for 0-member households */}
                {selectedMembers.length === 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>⚠️ Hộ gia đình chưa có thành viên. Bạn có thể thêm thành viên sau khi {initialData ? 'cập nhật' : 'tạo'} hộ.</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {initialData ? 'Cập nhật Hộ' : 'Tạo Hộ mới'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default HouseholdFormModal;
