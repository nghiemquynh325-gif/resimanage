
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import SearchableSelect from '../ui/SearchableSelect'; // New Import
import { Resident } from '../../types';
import { createResident, updateResident } from '../../utils/mockApi';
import { ADDRESS_DATA } from '../../constants/vietnam_address';

// Validation Schema
const residentSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal('')),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  identityCard: z.string().min(9, "CCCD/CMND phải có 9-12 số").max(12, "CCCD/CMND không hợp lệ"),
  dob: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Ngày sinh không hợp lệ" }),
  gender: z.enum(['Nam', 'Nữ', 'Khác']),
  residenceType: z.enum(['Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà']),
  address: z.string().optional(), // Full formatted address (auto-filled or manual)
  street: z.string().min(2, "Vui lòng nhập số nhà, tên đường"),
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  ward: z.string().min(1, "Vui lòng chọn Xã/Phường"),
  unit: z.string().min(1, "Vui lòng nhập Tổ"),
  education: z.string().optional(),
  hometown: z.string().optional(),
  profession: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  isHeadOfHousehold: z.boolean().default(false),
  isPartyMember: z.boolean().default(false),
  partyJoinDate: z.string().optional(),
  hasSpecialNotes: z.boolean().default(false),
  specialNotes: z.string().optional(),
});

type ResidentFormData = z.infer<typeof residentSchema>;

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Resident;
}

const ResidentFormModal: React.FC<ResidentFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      gender: 'Nam',
      residenceType: 'Thường trú',
      isHeadOfHousehold: false,
      isPartyMember: false,
      hasSpecialNotes: false,
      province: '',
      ward: '',
      street: ''
    }
  });

  const hasSpecialNotes = watch('hasSpecialNotes');
  const isPartyMember = watch('isPartyMember');
  const selectedProvince = watch('province');
  const selectedWard = watch('ward');

  // Derived state for wards based on selected province
  const availableWards = selectedProvince ? ADDRESS_DATA[selectedProvince] || [] : [];

  // Load initial data for Edit mode OR reset for Create mode
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const province = initialData.province || '';
        const ward = initialData.ward || '';
        const street = initialData.address && !province ? initialData.address : (initialData.address?.split(',')[0] || '');

        reset({
          fullName: initialData.fullName,
          email: initialData.email || '',
          phoneNumber: initialData.phoneNumber,
          identityCard: initialData.identityCard || '',
          dob: initialData.dob,
          gender: initialData.gender,
          residenceType: initialData.residenceType || 'Thường trú',
          street: street,
          province: province,
          ward: ward,
          address: initialData.address,
          unit: initialData.unit || '',
          education: initialData.education || '',
          hometown: initialData.hometown || '',
          profession: initialData.profession || '',
          ethnicity: initialData.ethnicity || '',
          religion: initialData.religion || '',
          isHeadOfHousehold: initialData.isHeadOfHousehold || false,
          isPartyMember: initialData.isPartyMember || false,
          partyJoinDate: initialData.partyJoinDate || '',
          hasSpecialNotes: !!initialData.specialNotes,
          specialNotes: initialData.specialNotes || '',
        });
      } else {
        // Explicitly reset to defaults for new entry
        reset({
          fullName: '',
          email: '',
          phoneNumber: '',
          identityCard: '',
          dob: '',
          gender: 'Nam',
          residenceType: 'Thường trú',
          street: '',
          province: '',
          ward: '',
          address: '',
          unit: '',
          education: '',
          hometown: '',
          profession: '',
          ethnicity: 'Kinh',
          religion: 'Không',
          isHeadOfHousehold: false,
          isPartyMember: false,
          partyJoinDate: '',
          hasSpecialNotes: false,
          specialNotes: '',
        });
      }
      setSubmitError(null);
    }
  }, [isOpen, initialData, reset]);

  // Handle province change to reset ward
  useEffect(() => {
    // If the currently selected ward is not in the new province's list, reset it
    const currentWard = watch('ward');
    if (selectedProvince && currentWard) {
      const wards = ADDRESS_DATA[selectedProvince] || [];
      if (!wards.includes(currentWard)) {
        setValue('ward', '');
      }
    }
  }, [selectedProvince, setValue, watch]);

  const onSubmit = async (data: ResidentFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Construct full address string
      const fullAddress = `${data.street}, ${data.ward}, ${data.province}`;

      const payload = {
        ...data,
        address: fullAddress, // Override composite address
        status: 'active' as 'active' | 'inactive' | 'pending_approval' | 'rejected',
        specialNotes: data.hasSpecialNotes ? data.specialNotes : undefined,
        partyJoinDate: data.isPartyMember ? data.partyJoinDate : undefined,
      };

      if (initialData) {
        // Edit Mode
        await updateResident(initialData.id, payload);
      } else {
        // Create Mode
        await createResident({
          ...payload,
          avatar: '', // generated in backend/mock
        });
      }

      onSuccess(); // Trigger parent refresh
      onClose();   // Close modal
    } catch (error: any) {
      setSubmitError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Chỉnh sửa Thông tin Cư dân" : "Thêm Cư dân mới"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên *"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Số điện thoại *"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <Input
            label="Số CCCD/CMND *"
            {...register('identityCard')}
            error={errors.identityCard?.message}
          />
          <Input
            label="Ngày sinh *"
            type="date"
            {...register('dob')}
            error={errors.dob?.message}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính *</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Thông tin chi tiết</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Dân tộc" {...register('ethnicity')} />
            <Input label="Tôn giáo" {...register('religion')} />
            <Input label="Quê quán" {...register('hometown')} />
            <div className="md:col-span-2">
              <Input label="Trình độ văn hóa" {...register('education')} placeholder="Ví dụ: 12/12, Đại học..." />
            </div>
            <Input label="Chuyên môn" {...register('profession')} placeholder="Ví dụ: Kỹ sư, Bác sĩ..." />
          </div>
        </div>

        {/* Address Info */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Nơi ở & Cư trú</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Province Searchable Select */}
            <SearchableSelect
              label="Tỉnh/Thành phố *"
              options={Object.keys(ADDRESS_DATA)}
              value={selectedProvince}
              onChange={(val) => {
                setValue('province', val, { shouldValidate: true });
                setValue('ward', '', { shouldValidate: true }); // Reset ward when province changes
              }}
              placeholder="-- Chọn Tỉnh/TP --"
              error={errors.province?.message}
            />

            {/* Ward Searchable Select */}
            <SearchableSelect
              label="Xã/Phường *"
              options={availableWards}
              value={selectedWard}
              onChange={(val) => setValue('ward', val, { shouldValidate: true })}
              placeholder="-- Chọn Xã/Phường --"
              error={errors.ward?.message}
              disabled={!selectedProvince}
            />

            <div className="md:col-span-2">
              <Input
                label="Số nhà, tên đường *"
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ..."
                {...register('street')}
                error={errors.street?.message}
              />
            </div>

            <Input
              label="Tổ dân phố *"
              type="number"
              {...register('unit')}
              error={errors.unit?.message}
              placeholder="Nhập số tổ..."
              min="1"
              step="1"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái cư trú *</label>
              <select
                {...register('residenceType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Thường trú">Thường trú</option>
                <option value="Tạm trú">Tạm trú</option>
                <option value="Tạm trú có nhà">Tạm trú có nhà</option>
                <option value="Tạm vắng">Tạm vắng</option>
              </select>
              {errors.residenceType && <p className="text-xs text-red-600 mt-1">{errors.residenceType.message}</p>}
            </div>
          </div>
        </div>

        {/* Extra Flags */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isHeadOfHousehold')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium">Là Chủ hộ</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isPartyMember')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium">Là Đảng viên</span>
          </label>

          {isPartyMember && (
            <div className="animate-in fade-in slide-in-from-top-2 ml-6">
              <Input
                label="Ngày vào Đảng"
                type="date"
                {...register('partyJoinDate')}
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('hasSpecialNotes')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 font-medium">Đặc điểm (Ghi chú thêm)</span>
          </label>

          {hasSpecialNotes && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <textarea
                {...register('specialNotes')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Nhập ghi chú đặc biệt (ví dụ: Gia đình chính sách, người có công...)"
              />
            </div>
          )}
        </div>

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
            {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            {initialData ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResidentFormModal;
