
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle, Wrench } from 'lucide-react';
import Input from '../components/ui/Input';
import FileUpload from '../components/ui/FileUpload';
import SearchableSelect from '../components/ui/SearchableSelect';
import { ADDRESS_DATA } from '../constants/vietnam_address';
import { registerResident, mockImageUpload } from '../utils/mockApi';
// Remove Supabase import to avoid triggered errors
// import { supabase } from '../utils/supabaseClient';

// 1. Define Zod Schema
const registerSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  phoneNumber: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').regex(/^[0-9]+$/, 'SĐT chỉ được chứa số'),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  identityCard: z.string().min(9, 'CCCD/CMND phải có 9-12 số').max(12, 'CCCD/CMND không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  ward: z.string().min(1, 'Vui lòng chọn Xã/Phường'),
  street: z.string().min(5, 'Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)'),
  unit: z.string().min(1, 'Tổ dân phố là bắt buộc'),
  idFront: z.custom<File>((v) => v instanceof File, { message: 'Vui lòng tải ảnh mặt trước CCCD' }),
  idBack: z.custom<File>((v) => v instanceof File, { message: 'Vui lòng tải ảnh mặt sau CCCD' }),
  terms: z.literal(true, { errorMap: () => ({ message: "Bạn phải đồng ý với Điều khoản Dịch vụ" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<'resident' | 'admin'>('resident');
  const navigate = useNavigate();

  // Redirect to admin registration page if admin is selected
  useEffect(() => {
    if (registrationType === 'admin') {
      navigate('/register-admin');
    }
  }, [registrationType, navigate]);

  // 2. Initialize Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      province: '',
      ward: '',
      street: '',
      unit: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      identityCard: '',
      terms: undefined as any, // Will be set by user interaction
    }
  });

  const selectedProvince = watch('province');
  const availableWards = selectedProvince ? ADDRESS_DATA[selectedProvince] || [] : [];

  // Reset ward when province changes
  useEffect(() => {
    // Only reset if ward is not in the new list
    const currentWard = watch('ward');
    if (selectedProvince && currentWard) {
      const wards = ADDRESS_DATA[selectedProvince] || [];
      if (!wards.includes(currentWard)) {
        setValue('ward', '');
      }
    }
  }, [selectedProvince, setValue, watch]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // 1. Simulate Image Upload (Concurrent)
      const [frontUrl, backUrl] = await Promise.all([
        mockImageUpload(data.idFront),
        mockImageUpload(data.idBack)
      ]);

      // 2. Prepare Data Payload for Admin Review (Mock DB)
      // Note: We skip Supabase Auth creation to prevent "Database error saving new user" 
      // when the backend trigger fails or keys are invalid.
      const fullAddress = `${data.street}, ${data.ward}, ${data.province}`;
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password, // Saved for mock login
        identityCard: data.identityCard,
        address: fullAddress,
        unit: data.unit,
        province: data.province,
        ward: data.ward,
        idFrontUrl: frontUrl,
        idBackUrl: backUrl,
      };

      // 3. Call Mock API to sync data for the Admin Dashboard and create account
      await registerResident(payload);

      // 4. Redirect on Success
      navigate('/registration-pending');

    } catch (error: any) {
      // Handle Errors
      let msg = error.message;

      if (msg.includes('Email này đã được đăng ký')) {
        msg = 'Email này đã được đăng ký. Vui lòng dùng email khác.';
      }

      setServerError(msg || 'Đăng ký thất bại. Vui lòng thử lại.');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Dev Tool: Auto Fill ---
  const handleAutoFill = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    setValue('email', `cu.dan.${randomNum}@example.com`, { shouldValidate: true });
    setValue('password', '123123123', { shouldValidate: true });
    setValue('confirmPassword', '123123123', { shouldValidate: true });
    setValue('fullName', 'Nguyễn Văn Cư Dân', { shouldValidate: true });
    setValue('phoneNumber', `09${Math.floor(Math.random() * 100000000)}`, { shouldValidate: true });
    setValue('identityCard', `0${Math.floor(Math.random() * 100000000000)}`, { shouldValidate: true });
    setValue('street', '123 Đường Dân Chủ', { shouldValidate: true });
    setValue('unit', 'Tổ 5', { shouldValidate: true });
    setValue('province', 'Tỉnh Đồng Nai', { shouldValidate: true });
    setValue('ward', 'Phường An Bình', { shouldValidate: true });
    setValue('terms', true, { shouldValidate: true });

    alert("Đã điền thông tin mẫu. Vui lòng CHỌN ẢNH thủ công để hoàn tất.");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Quay lại Đăng nhập
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Tạo Tài khoản</h1>
            <p className="text-blue-100 mt-2">Vui lòng chọn loại tài khoản và điền đầy đủ thông tin.</p>
          </div>

          {/* Registration Type Selector */}
          <div className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50">
            <label className="block text-sm font-medium text-slate-700 mb-3">Loại tài khoản *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRegistrationType('resident')}
                className={`p-4 border-2 rounded-lg transition-all ${registrationType === 'resident'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="text-center">
                  <span className={`block text-lg font-bold ${registrationType === 'resident' ? 'text-blue-700' : 'text-slate-700'}`}>
                    👤 Cư dân
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Dành cho người dân sinh sống tại khu vực</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRegistrationType('admin')}
                className={`p-4 border-2 rounded-lg transition-all ${registrationType === 'admin'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="text-center">
                  <span className={`block text-lg font-bold ${registrationType === 'admin' ? 'text-blue-700' : 'text-slate-700'}`}>
                    👔 Cán bộ Quản lý
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Dành cho cán bộ, nhân viên ban quản lý</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">{serverError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span>{serverError}</span>
            </div>
          )}

            {/* Account Info */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Thông tin Tài khoản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="nguoidung@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Số điện thoại *"
                  placeholder="09..."
                  {...register('phoneNumber')}
                  error={errors.phoneNumber?.message}
                />
                <Input
                  label="Mật khẩu *"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Input
                  label="Xác nhận mật khẩu *"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </section>

            {/* Personal Info */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Thông tin Cá nhân
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Họ và tên *"
                    placeholder="Nguyễn Văn A"
                    {...register('fullName')}
                    error={errors.fullName?.message}
                  />
                  <Input
                    label="Số CCCD/CMND *"
                    placeholder="012345678901"
                    {...register('identityCard')}
                    error={errors.identityCard?.message}
                  />
                </div>

                {/* Address Group */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">Địa chỉ Căn hộ / Nơi ở</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableSelect
                      label="Tỉnh/Thành phố *"
                      options={Object.keys(ADDRESS_DATA)}
                      value={selectedProvince}
                      onChange={(val) => {
                        setValue('province', val, { shouldValidate: true });
                        setValue('ward', '', { shouldValidate: true });
                      }}
                      error={errors.province?.message}
                    />
                    <SearchableSelect
                      label="Xã/Phường *"
                      options={availableWards}
                      value={watch('ward')}
                      onChange={(val) => setValue('ward', val, { shouldValidate: true })}
                      disabled={!selectedProvince}
                      error={errors.ward?.message}
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Số nhà, tên đường *"
                        placeholder="Số 123, Đường ABC"
                        {...register('street')}
                        error={errors.street?.message}
                      />
                    </div>
                    <Input
                      label="Tổ dân phố *"
                      placeholder="Tổ 1"
                      {...register('unit')}
                      error={errors.unit?.message}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ID Card Upload */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Xác thực Danh tính (CCCD)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Ảnh mặt trước *"
                  onChange={(file) => {
                    setValue('idFront', file, { shouldValidate: true });
                  }}
                  error={errors.idFront?.message as string}
                />
                <FileUpload
                  label="Ảnh mặt sau *"
                  onChange={(file) => {
                    setValue('idBack', file, { shouldValidate: true });
                  }}
                  error={errors.idBack?.message as string}
                />
              </div>
            </section>

            {/* Terms */}
            <div className="pt-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                  {...register('terms')}
                />
                <span className="text-sm text-slate-600">
                  Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản Dịch vụ</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách Bảo mật</a> của Ban quản lý.
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-sm text-red-600 font-medium ml-8">{errors.terms.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all flex justify-center items-center gap-2
                ${(isSubmitting || !isValid) ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Đăng ký Tài khoản'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Dev Tool: Auto Fill Button */}
      {process.env.NODE_ENV !== 'production' && (
        <button
          type="button"
          onClick={handleAutoFill}
          className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs hover:bg-slate-700 transition-colors opacity-80 hover:opacity-100"
          title="Công cụ hỗ trợ kiểm thử"
        >
          <Wrench size={14} />
          Tự động điền Form
        </button>
      )}
    </div>
  );
};

export default RegisterPage;
