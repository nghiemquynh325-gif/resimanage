
import React from 'react';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, FileCheck, X, Home, UserCircle } from 'lucide-react';
import { Role } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void; // Keeping prop for interface compatibility, though logic uses store
  role: Role; // Used for menu filtering
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, role, isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    // --- Admin Items ---
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'residents', label: 'Quản lý Cư dân', icon: Users, roles: ['ADMIN'] },
    { id: 'households', label: 'Quản lý Hộ gia đình', icon: Home, roles: ['ADMIN'] },
    { id: 'associations', label: 'Quản lý Chi Hội', icon: Users, roles: ['ADMIN'] },
    { id: 'approvals', label: 'Phê duyệt', icon: FileCheck, roles: ['ADMIN'] },

    // --- Resident Items ---
    { id: 'profile', label: 'Thông tin cá nhân', icon: UserCircle, roles: ['RESIDENT'] },

    // --- Shared Items ---
    { id: 'events', label: 'Lịch & Công tác', icon: Calendar, roles: ['ADMIN', 'RESIDENT'] },
    { id: 'community', label: 'Cộng đồng', icon: MessageSquare, roles: ['ADMIN', 'RESIDENT'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const handleLogoutClick = async () => {
    await logout();
  };

  const getRoleDisplayName = (r?: Role) => {
    if (r === 'ADMIN') return 'Cán bộ quản lý';
    if (r === 'RESIDENT') return 'Cư dân';
    return 'Khách';
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between lg:justify-center h-16 border-b border-slate-200 flex-shrink-0 px-4 lg:px-0">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2 tracking-tight">
            ResiManage
          </h1>
          {/* Close Button (Mobile Only) */}
          <button
            onClick={toggleSidebar}
            className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${currentView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon size={20} className={currentView === item.id ? 'text-blue-600' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0D8ABC&color=fff`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate" title={user?.fullName}>
                {user?.fullName || 'Người dùng'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
