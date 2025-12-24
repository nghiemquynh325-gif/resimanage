import React, { useState } from 'react';
import { Role } from '../types';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">ResiManage</h1>
          <p className="text-slate-500">Hệ thống Quản lý Khu dân cư thông minh</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(false)}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`border rounded-lg p-3 text-center transition-all ${role === 'ADMIN' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
              >
                <span className="block font-bold text-sm">Cán bộ</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('RESIDENT')}
                className={`border rounded-lg p-3 text-center transition-all ${role === 'RESIDENT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
              >
                <span className="block font-bold text-sm">Cư dân</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email / Số điện thoại</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="nhap@email.com"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required 
            />
          </div>

          {!isLogin && (
             <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận Mật khẩu</label>
             <input 
               type="password" 
               className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
               placeholder="••••••••"
               required 
             />
           </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
          >
            {isLogin ? 'Đăng nhập' : 'Gửi yêu cầu đăng ký'}
          </button>

          {isLogin && (
            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;