
import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <NotificationBell />
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700 leading-tight max-w-[150px] truncate">
                {user?.fullName || 'Người dùng'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase leading-tight">
                {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Cư dân'}
              </span>
            </div>
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-3 border-b border-slate-50 md:hidden bg-slate-50">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Cư dân'}</p>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User size={18} />
                  Hồ sơ cá nhân
                </Link>
                
                <div className="border-t border-slate-50 my-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
