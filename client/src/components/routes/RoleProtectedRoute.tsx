import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/features/auth/types';
import { FullPageLoader } from '../ui/FullPageLoader';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  children?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/unauthorized',
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader message="Checking access permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    console.warn(
      `[AUTH GUARD] Access denied to ${location.pathname}. Role '${user.role}' not in allowed roles:`,
      allowedRoles
    );
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
