import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { Menu } from 'lucide-react';
import { Role } from '../../types';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock role for now, in real app this comes from auth store/context
  const role: Role = 'ADMIN'; 

  // Map current path to sidebar view ID
  const getCurrentView = () => {
    const path = location.pathname.substring(1); // remove leading slash
    if (path === '' || path === 'dashboard') return 'dashboard';
    return path;
  };

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/login');
  };

  const handleChangeView = (viewId: string) => {
    if (viewId === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${viewId}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={getCurrentView()} 
        onChangeView={handleChangeView} 
        onLogout={handleLogout} 
        role={role}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64`}>
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between lg:hidden sticky top-0 z-10">
          <h1 className="font-bold text-blue-600 text-lg">ResiManage</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;