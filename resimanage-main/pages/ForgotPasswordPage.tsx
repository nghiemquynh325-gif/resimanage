
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import { requestPasswordReset } from '../utils/mockApi';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (error) {
      // In a real app, you might want to show a generic error or nothing for security
      // Here we just toggle success to show the "check email" message anyway
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Kiểm tra email của bạn</h2>
            <p className="text-slate-600 text-sm">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email bạn cung cấp. Vui lòng kiểm tra cả hộp thư rác.
            </p>
            <div className="pt-4">
              <Link to="/login" className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Quên Mật khẩu?</h1>
              <p className="text-slate-500 text-sm mt-2">
                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <Input
                  label="Email đăng ký"
                  type="email"
                  placeholder="nhap@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-[34px] text-slate-400" size={18} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  'Gửi Yêu Cầu'
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 transition-colors">
                  <ArrowLeft size={16} />
                  Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
