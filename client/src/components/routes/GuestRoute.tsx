import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '../ui/FullPageLoader';

interface GuestRouteProps {
  children?: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader message="Checking authentication status..." />;
  }

  if (isAuthenticated && user) {
    let redirectPath = '/customer/dashboard';
    switch (user.role) {
      case 'SUPER_ADMIN':
        redirectPath = '/super-admin/dashboard';
        break;
      case 'ORG_ADMIN':
        redirectPath = '/admin/dashboard';
        break;
      case 'STAFF':
        redirectPath = '/staff/dashboard';
        break;
      case 'CUSTOMER':
      default:
        redirectPath = '/customer/dashboard';
        break;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
