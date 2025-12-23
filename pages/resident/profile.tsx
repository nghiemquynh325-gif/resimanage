import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Lock, User as UserIcon, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { getUserProfile, updateUserProfile, changePassword } from '../../utils/mockApi';
import { Resident } from '../../types';

// Validation Schemas
const infoSchema = z.object({
  email: z.string().email("Email không hợp lệ").optional().or(z.literal('')),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  fullName: z.string(), // Read-only but included
  address: z.string(), // Read-only but included
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type InfoFormData = z.infer<typeof infoSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ResidentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<Resident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form Hooks
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo, isSubmitting: isSubmittingInfo, isDirty: isInfoDirty, isValid: isInfoValid }
  } = useForm<InfoFormData>({ resolver: zodResolver(infoSchema) });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: errorsPass, isSubmitting: isSubmittingPass, isDirty: isPassDirty, isValid: isPassValid }
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  // Load Profile (Simulates GET /api/me)
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await getUserProfile(user.id);
        setProfile(data);
        resetInfo({
          fullName: data.fullName,
          address: data.address,
          email: data.email || '',
          phoneNumber: data.phoneNumber,
        });
      } catch (error) {
        console.error("Failed to load profile", error);
        showToast('Không thể tải thông tin hồ sơ', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id, resetInfo]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Submit Handlers
  const onInfoSubmit = async (data: InfoFormData) => {
    if (!user?.id) return;
    try {
      // Mock API call (Simulates PUT /api/me)
      const updatedProfile = await updateUserProfile(user.id, {
        phoneNumber: data.phoneNumber,
        // Email is read-only in UI, but if it were editable we'd send it
      });

      // Update Local State & Global Auth State
      setProfile(updatedProfile);
      updateUser({
        phoneNumber: data.phoneNumber,
      });

      // Reset form with new values to clear dirty state
      resetInfo(data);
      
      showToast('Cập nhật hồ sơ thành công', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user?.id) return;
    try {
      // Simulates POST /api/auth/change-password
      await changePassword(user.id, data.currentPassword, data.newPassword);
      showToast('Đổi mật khẩu thành công', 'success');
      resetPass(); // Clear the form
    } catch (error: any) {
      showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              {isLoading ? (
                <div className="w-32 h-32 rounded-full bg-slate-200 animate-pulse"></div>
              ) : (
                <img 
                  src={profile?.avatar || user?.avatar} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                />
              )}
              <button 
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                title="Thay đổi ảnh"
              >
                <Camera size={18} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800">{profile?.fullName}</h2>
                <p className="text-sm text-slate-500">{profile?.status}</p>
                {profile?.isHeadOfHousehold && (
                  <span className="mt-2 inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded border border-blue-100">
                    Chủ hộ
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Info Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <UserIcon className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-slate-800">Thông tin cơ bản</h3>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInfo(onInfoSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="opacity-70 pointer-events-none">
                     <Input 
                        label="Họ và tên" 
                        {...registerInfo('fullName')} 
                        readOnly 
                        className="bg-slate-50"
                     />
                  </div>
                  <div className="opacity-70 pointer-events-none">
                     <Input 
                        label="Địa chỉ căn hộ" 
                        {...registerInfo('address')} 
                        readOnly 
                        className="bg-slate-50"
                     />
                  </div>
                  <div className="opacity-70 pointer-events-none">
                    <Input 
                        label="Email (Chỉ đọc)" 
                        type="email"
                        {...registerInfo('email')} 
                        readOnly
                        className="bg-slate-50"
                        error={errorsInfo.email?.message} 
                    />
                  </div>
                  <Input 
                    label="Số điện thoại" 
                    {...registerInfo('phoneNumber')} 
                    error={errorsInfo.phoneNumber?.message} 
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingInfo || !isInfoDirty}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingInfo ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Lock className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-slate-800">Đổi mật khẩu</h3>
            </div>

            <form onSubmit={handleSubmitPass(onPasswordSubmit)} className="space-y-4 max-w-md">
              <Input 
                label="Mật khẩu hiện tại" 
                type="password"
                {...registerPass('currentPassword')} 
                error={errorsPass.currentPassword?.message} 
              />
              <Input 
                label="Mật khẩu mới" 
                type="password"
                {...registerPass('newPassword')} 
                error={errorsPass.newPassword?.message} 
              />
              <Input 
                label="Xác nhận mật khẩu mới" 
                type="password"
                {...registerPass('confirmPassword')} 
                error={errorsPass.confirmPassword?.message} 
              />
              
              <div className="flex justify-start pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPass || !isPassValid}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPass ? <Loader2 size={18} className="animate-spin" /> : null}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResidentProfilePage;