
import React, { useEffect, useState } from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterAdminPage from './pages/RegisterAdminPage';
import RegistrationPendingPage from './pages/RegistrationPendingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/admin/dashboard';
import ResidentsPage from './pages/admin/residents/index';
import ApprovalsPage from './pages/admin/approvals';
import HouseholdsPage from './pages/admin/households/index';
import EventsPage from './pages/admin/events';
import Community from './components/Community';
import ResidentHomePage from './pages/resident/home';
import ResidentProfilePage from './pages/resident/profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import RoleRoute from './components/common/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAuthStore } from './stores/authStore';
import { seedDatabase } from './utils/mockApi';

// Helper component to redirect logged-in user based on role at root path
const HomeRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }
  return <Navigate to="/resident/home" replace />;
};

// Create the router configuration
const router = createHashRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/register-admin",
        element: <RegisterAdminPage />,
      },
      {
        path: "/registration-pending",
        element: <RegistrationPendingPage />,
      },
      {
        path: "/auth/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage />,
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          // Dynamic Index Route
          {
            index: true,
            element: <HomeRedirect />,
          },

          // --- Admin Only Routes ---
          {
            element: <RoleRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: "dashboard", element: <AdminDashboardPage /> },
              { path: "residents", element: <ResidentsPage /> },
              { path: "households", element: <HouseholdsPage /> },
              { path: "approvals", element: <ApprovalsPage /> },
            ]
          },

          // --- Shared/Resident Routes ---
          {
            path: "events",
            element: <EventsPage />,
          },
          {
            path: "calendar",
            element: <Navigate to="/events" replace />,
          },
          {
            path: "community",
            element: <Community role="RESIDENT" />,
          },
          {
            path: "resident/home",
            element: <ResidentHomePage />,
          },
          {
            path: "profile",
            element: <ResidentProfilePage />,
          }
        ],
      },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  }
]);

function App() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      seedDatabase(); // Seed mock data
      await loadSession(); // Restore session from localStorage
      setIsAppReady(true);
    };
    initApp();
  }, [loadSession]);

  if (!isAppReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
