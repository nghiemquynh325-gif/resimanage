import React from 'react';
import { LayoutDashboard, Users, Calendar, MessageSquare, LogOut, Menu } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  role: Role;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, role, isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'residents', label: 'Quản lý Cư dân', icon: Users, roles: ['ADMIN'] },
    { id: 'calendar', label: 'Lịch & Công tác', icon: Calendar, roles: ['ADMIN', 'RESIDENT'] },
    { id: 'community', label: 'Cộng đồng', icon: MessageSquare, roles: ['ADMIN', 'RESIDENT'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-slate-200">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              ResiManage
            </h1>
          </div>

          <div className="flex flex-col flex-1 p-4 gap-2">
            <div className="mb-4 px-4 py-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Vai trò</p>
              <p className="text-sm font-medium text-slate-800">{role === 'ADMIN' ? 'Cán bộ quản lý' : 'Cư dân'}</p>
            </div>

            <nav className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;