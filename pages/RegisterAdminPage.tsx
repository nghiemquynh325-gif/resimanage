
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle, UserCog } from 'lucide-react';
import Input from '../components/ui/Input';
import { registerAdminStaff } from '../utils/mockApi';

// Zod Schema for Admin Registration
const adminRegisterSchema = z.object({
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    phoneNumber: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').regex(/^[0-9]+$/, 'SĐT chỉ được chứa số'),
    password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    identityCard: z.string().min(9, 'CCCD/CMND phải có 9-12 số').max(12, 'CCCD/CMND không hợp lệ'),
    position: z.string().optional(),
    department: z.string().optional(),
    terms: z.literal(true, { errorMap: () => ({ message: "Bạn phải đồng ý với Điều khoản Dịch vụ" }) }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;

const RegisterAdminPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<AdminRegisterFormData>({
        resolver: zodResolver(adminRegisterSchema),
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            identityCard: '',
            position: '',
            department: '',
            terms: false,
        }
    });

    const onSubmit = async (data: AdminRegisterFormData) => {
        setServerError(null);
        setIsSubmitting(true);

        try {
            await registerAdminStaff({
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                identityCard: data.identityCard,
                position: data.position,
                department: data.department,
                password: data.password,
            });

            navigate('/registration-pending');
        } catch (error: any) {
            let msg = error.message;

            if (msg.includes('duplicate key') || msg.includes('already exists')) {
                msg = 'Email này đã được đăng ký. Vui lòng dùng email khác.';
            }

            setServerError(msg || 'Đăng ký thất bại. Vui lòng thử lại.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại Đăng nhập
                </Link>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <UserCog size={32} className="text-white" />
                            <div>
                                <h1 className="text-3xl font-bold text-white">Đăng ký Cán bộ Quản lý</h1>
                                <p className="text-blue-100 mt-1">Dành cho cán bộ, nhân viên ban quản lý</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        {serverError && (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Email *"
                                    type="email"
                                    placeholder="admin@example.com"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Input
                                    label="Chức vụ"
                                    placeholder="Trưởng phòng, Phó phòng..."
                                    {...register('position')}
                                    error={errors.position?.message}
                                />
                                <Input
                                    label="Phòng ban"
                                    placeholder="Hành chính, Tổ chức..."
                                    {...register('department')}
                                    error={errors.department?.message}
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
                                    Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản Dịch vụ</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách Bảo mật</a>.
                                </span>
                            </label>
                            {errors.terms && <p className="mt-1 text-sm text-red-600 font-medium ml-8">{errors.terms.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all flex justify-center items-center gap-2
                ${(isSubmitting || !isValid) ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99]'}
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

                        {/* Link to Resident Registration */}
                        <div className="text-center pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600">
                                Bạn là cư dân? <Link to="/register" className="text-blue-600 hover:underline font-medium">Đăng ký tài khoản cư dân</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdminPage;
