
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Role } from '../../types';

interface RoleRouteProps {
  allowedRoles: Role[];
  redirectPath?: string;
  children?: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, redirectPath = '/resident/home', children }) => {
  const { user } = useAuthStore();

  // If user role is not in allowedRoles, redirect
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
