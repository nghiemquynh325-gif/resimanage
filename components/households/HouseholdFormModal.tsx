
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, X, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import SearchableSelect from '../ui/SearchableSelect';
import { Household, Resident } from '../../types';
import { createHousehold, updateHousehold } from '../../utils/mockApi';

// Schema
const householdSchema = z.object({
  headOfHouseholdId: z.string().min(1, "Vui lòng chọn chủ hộ"),
  unit: z.string().min(1, "Vui lòng nhập tổ dân phố"),
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
    }
  });

  const headOfHouseholdId = watch('headOfHouseholdId');

  // Reset/Init form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          headOfHouseholdId: initialData.headOfHouseholdId,
          unit: initialData.unit,
        });
        setSelectedMembers(initialData.memberIds);
        setRelationships(initialData.relationships || {});
      } else {
        reset({
          headOfHouseholdId: '',
          unit: '',
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
      setSelectedMembers(prev => [...prev, id]);
    }
  };

  const handleRelationshipChange = (id: string, value: string) => {
    setRelationships(prev => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (data: HouseholdFormData) => {
    if (!selectedHead) {
      alert('Vui lòng chọn chủ hộ');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên');
      return;
    }
    setIsSubmitting(true);
    try {
      // Remove head from relationships (head should not have a relationship)
      const cleanRelationships = { ...relationships };
      delete cleanRelationships[data.headOfHouseholdId];

      const payload = {
        name: `Hộ ${selectedHead.fullName}`,
        address: selectedHead.address || 'Chưa cập nhật',
        unit: data.unit,
        headOfHouseholdId: data.headOfHouseholdId,
        memberIds: selectedMembers,
        relationships: cleanRelationships,
      };

      if (initialData) {
        await updateHousehold(initialData.id, payload);
      } else {
        await createHousehold(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi lưu thông tin.');
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
        </div>

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
              const filteredMembers = potentialMembers.filter(resident =>
                resident.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase())
              );

              if (potentialMembers.length === 0) {
                return (
                  <div className="p-4 text-center text-slate-500 text-sm">Không còn cư dân nào khả dụng.</div>
                );
              }

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
