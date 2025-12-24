
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import DevTools from '../components/common/DevTools';
import { Loader2, AlertCircle } from 'lucide-react';

// LocalStorage key for saved credentials
const REMEMBER_ME_KEY = 'resimanage_remember_me';

const LoginPage: React.FC = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  // Local UI State for submission handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Dynamic Schema Construction
  const baseSchema = z.object({
    role: z.enum(['ADMIN', 'RESIDENT']),
    email: z.string().min(1, 'Email/SĐT là bắt buộc'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    rememberMe: z.boolean().optional(),
  });

  type AuthFormData = z.infer<typeof baseSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      role: 'ADMIN',
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    if (saved) {
      try {
        const { email, password, role } = JSON.parse(saved);
        setValue('email', email);
        setValue('password', password);
        setValue('role', role);
        setValue('rememberMe', true);
      } catch (error) {
        // Invalid data, clear it
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }, [setValue]);

  const selectedRole = watch('role');

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Save credentials if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role
        }));
      } else {
        // Clear saved credentials if unchecked
        localStorage.removeItem(REMEMBER_ME_KEY);
      }

      await login(data.email, data.password, data.role);
      // NOTE: Navigation is handled by PublicRoute observing 'isAuthenticated' state change.
    } catch (err: any) {
      setLocalError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <DevTools />
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">ResiManage</h1>
          <p className="text-slate-500 text-sm md:text-base">Hệ thống Quản lý Khu dân cư thông minh</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            className="flex-1 py-2 text-sm font-medium rounded-md transition-all bg-white text-blue-600 shadow-sm"
            type="button"
          >
            Đăng nhập
          </button>
          <button
            className="flex-1 py-2 text-sm font-medium rounded-md transition-all text-slate-500 hover:text-slate-700"
            onClick={() => navigate('/register')}
            type="button"
          >
            Đăng ký
          </button>
        </div>

        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'ADMIN')}
                className={`border rounded-lg p-3 text-center transition-all ${selectedRole === 'ADMIN' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="block font-bold text-sm">Cán bộ</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'RESIDENT')}
                className={`border rounded-lg p-3 text-center transition-all ${selectedRole === 'RESIDENT' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="block font-bold text-sm">Cư dân</span>
              </button>
            </div>
            {/* Hidden inputs to ensure fields are registered */}
            <input type="hidden" {...register('role')} />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email / Số điện thoại</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              placeholder="nhap@email.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-sm text-slate-600">Ghi nhớ tài khoản và mật khẩu</span>
            </label>

            <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
