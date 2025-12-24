
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPortal } from 'react-dom';
import { Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { CalendarEvent } from '../../types';
import { createEvent, updateEvent, deleteEvent } from '../../utils/mockApi';

// Validation Schema
const eventSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề sự kiện"),
  start: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  end: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  location: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['Họp', 'Sinh hoạt', 'Khác']),
}).refine(data => new Date(data.end) > new Date(data.start), {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["end"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventData?: CalendarEvent | null;
  initialDate?: { start: string, end: string } | null;
  readOnly?: boolean;
}

// Helper to format Date ISO string to datetime-local input value (YYYY-MM-DDTHH:mm)
const formatForInput = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Adjust for local timezone to ensure input displays correct local time
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  eventData, 
  initialDate,
  readOnly = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'Họp'
    }
  });

  // Handle Toast Timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (eventData) {
        // Editing existing event
        reset({
          title: eventData.title,
          start: formatForInput(eventData.start),
          end: formatForInput(eventData.end),
          location: eventData.extendedProps?.location || '',
          description: eventData.extendedProps?.description || '',
          type: eventData.extendedProps?.type || 'Khác',
        });
      } else if (initialDate) {
        // Creating new event from selection
        let endString = initialDate.end;
        if (new Date(initialDate.end).getTime() - new Date(initialDate.start).getTime() === 86400000) {
           const startDate = new Date(initialDate.start);
           startDate.setHours(8, 0, 0, 0);
           const endDate = new Date(startDate);
           endDate.setHours(9, 0, 0, 0);
           
           initialDate.start = startDate.toISOString();
           endString = endDate.toISOString();
        }

        reset({
          title: '',
          start: formatForInput(initialDate.start),
          end: formatForInput(endString),
          location: '',
          description: '',
          type: 'Họp',
        });
      } else {
        reset({
          title: '',
          start: '',
          end: '',
          location: '',
          description: '',
          type: 'Họp',
        });
      }
    }
  }, [isOpen, eventData, initialDate, reset]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const onSubmit = async (data: EventFormData) => {
    if (readOnly) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let color = '#2563eb'; 
      if (data.type === 'Sinh hoạt') color = '#16a34a'; 
      if (data.type === 'Khác') color = '#9333ea'; 

      const payload = {
        title: data.title,
        start: new Date(data.start).toISOString(),
        end: new Date(data.end).toISOString(),
        backgroundColor: color,
        extendedProps: {
          location: data.location,
          description: data.description,
          type: data.type
        }
      };

      if (eventData) {
        await updateEvent(eventData.id, payload);
        showToast('Cập nhật sự kiện thành công', 'success');
      } else {
        await createEvent(payload);
        showToast('Tạo sự kiện mới thành công', 'success');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (error: any) {
      setSubmitError(error.message || 'Có lỗi xảy ra.');
      showToast('Có lỗi xảy ra', 'error');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventData || readOnly) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
      setIsSubmitting(true);
      try {
        await deleteEvent(eventData.id);
        showToast('Đã xóa sự kiện', 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } catch (error: any) {
        setSubmitError(error.message);
        showToast('Lỗi khi xóa sự kiện', 'error');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={readOnly ? "Chi tiết Sự kiện" : (eventData ? "Chỉnh sửa Sự kiện" : "Tạo Sự kiện Mới")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {submitError}
            </div>
          )}

          <fieldset disabled={readOnly} className="space-y-6">
            <Input 
              label="Tiêu đề sự kiện *" 
              placeholder="Nhập tiêu đề (Ví dụ: Họp tổ dân phố...)"
              {...register('title')} 
              error={errors.title?.message} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Bắt đầu *" 
                type="datetime-local" 
                {...register('start')} 
                error={errors.start?.message} 
              />
              <Input 
                label="Kết thúc *" 
                type="datetime-local" 
                {...register('end')} 
                error={errors.end?.message} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Địa điểm" 
                placeholder="Ví dụ: Nhà văn hóa, Phòng họp..."
                {...register('location')} 
                error={errors.location?.message} 
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại sự kiện</label>
                <select 
                  {...register('type')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="Họp">Cuộc họp</option>
                  <option value="Sinh hoạt">Sinh hoạt chung</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
              <textarea 
                {...register('description')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="Nhập nội dung chi tiết sự kiện..."
              />
            </div>
          </fieldset>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            {/* Left side actions (Delete) - Only if Admin */}
            {!readOnly && eventData && (
              <button
                type="button"
                onClick={handleDelete}
                className="mr-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Trash2 size={16} />
                Xóa
              </button>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors ${readOnly ? 'w-24' : ''}`}
                disabled={isSubmitting}
              >
                {readOnly ? "Đóng" : "Hủy"}
              </button>
              
              {!readOnly && (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  Lưu
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Internal Toast Portal for Modal Context */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </>
  );
};

export default CreateEventModal;
