
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuthStore } from '../stores/authStore';
import DevTools from '../components/common/DevTools';
import { useNotificationStore } from '../stores/notificationStore';

/**
 * Main Layout Component
 * Wraps the authenticated part of the application.
 * Contains:
 * - Sidebar (Navigation)
 * - Header (Title & Notifications)
 * - Main Content Area (Outlet)
 * - DevTools (Debug helpers)
 * 
 * Also handles global background tasks like Notification Polling.
 */
const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUnreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  
  // Use actual user role from store
  const role = user?.role || 'RESIDENT'; 

  // --- Notification Polling Logic ---
  useEffect(() => {
    // Initial fetch on mount
    fetchUnreadCount();

    // Poll every 60 seconds to keep the badge updated
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  // Determine the current view ID based on the URL path for Sidebar highlighting
  const getCurrentView = () => {
    const path = location.pathname.substring(1);
    if (path === '' || path === 'dashboard') return 'dashboard';
    return path;
  };

  // Determine Page Title based on current view for the Header
  const getPageTitle = () => {
    const view = getCurrentView();
    switch (view) {
      case 'dashboard': return 'Tổng quan';
      case 'residents': return 'Quản lý Cư dân';
      case 'households': return 'Quản lý Hộ gia đình';
      case 'approvals': return 'Phê duyệt Đăng ký';
      case 'events': return 'Lịch & Công tác'; // Updated from calendar
      case 'calendar': return 'Lịch & Công tác';
      case 'community': return 'Cộng đồng';
      case 'profile': return 'Hồ sơ Cá nhân';
      case 'resident/home': return 'Trang chủ';
      default: return 'ResiManage';
    }
  };

  const handleLogout = () => {
    // Implement logout logic here (clear tokens, etc.)
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
      <DevTools />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={getCurrentView()} 
        onChangeView={handleChangeView} 
        onLogout={handleLogout} 
        role={role}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        
        {/* Top Header */}
        <Header 
          title={getPageTitle()} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
