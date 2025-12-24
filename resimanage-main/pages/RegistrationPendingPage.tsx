
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

const RegistrationPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Đăng ký thành công!</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Yêu cầu đăng ký của bạn đã được gửi đến Ban quản lý. Chúng tôi sẽ xem xét và phê duyệt hồ sơ của bạn trong vòng <span className="font-semibold">24 giờ</span>.
        </p>
        
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 mb-8">
          Vui lòng kiểm tra email hoặc quay lại sau để xem trạng thái tài khoản.
        </div>

        <Link 
          to="/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          Quay về Trang đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPendingPage;
