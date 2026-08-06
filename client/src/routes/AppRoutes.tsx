import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { RoleProtectedRoute } from '../components/routes/RoleProtectedRoute';
import { GuestRoute } from '../components/routes/GuestRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { OrganizationDashboardPage } from '../pages/admin/OrganizationDashboardPage';
import { OrganizationProfilePage } from '../pages/admin/OrganizationProfilePage';
import { OrganizationSettingsPage } from '../pages/admin/OrganizationSettingsPage';
import { BranchListPage } from '../pages/admin/BranchListPage';
import { BranchDetailsPage } from '../pages/admin/BranchDetailsPage';
import { ServiceListPage } from '../pages/admin/ServiceListPage';
import { ServiceDetailsPage } from '../pages/admin/ServiceDetailsPage';
import { CounterListPage } from '../pages/admin/CounterListPage';
import { CounterDetailsPage } from '../pages/admin/CounterDetailsPage';
import { AnalyticsDashboardPage } from '../pages/admin/AnalyticsDashboardPage';
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';
import { GenerateTokenPage } from '../pages/customer/GenerateTokenPage';
import { MyTokenTrackingPage } from '../pages/customer/MyTokenTrackingPage';
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { DisplayBoardPage } from '../pages/display/DisplayBoardPage';
import App from '../App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public Landing Root
      {
        path: '/',
        element: <CustomerLayout />,
        children: [
          {
            index: true,
            element: <App />,
          },
          {
            path: 'book',
            element: <GenerateTokenPage />,
          },
          {
            path: 'track',
            element: <div className="p-6 text-slate-300">Live Status Tracking Page Placeholder</div>,
          },
        ],
      },

      // PUBLIC Display Board Route (/display/:branchId) - No Auth Required
      {
        path: '/display/:branchId',
        element: <DisplayBoardPage />,
      },

      // Super Admin Dashboard Route Guard (/super-admin/dashboard)
      {
        path: '/super-admin',
        element: (
          <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <OrganizationDashboardPage />,
          },
        ],
      },

      // Org Admin & Staff Dashboard Route Guard (/admin)
      {
        path: '/admin',
        element: (
          <RoleProtectedRoute allowedRoles={['ORG_ADMIN', 'SUPER_ADMIN', 'STAFF']}>
            <AdminLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <OrganizationDashboardPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsDashboardPage />,
          },
          {
            path: 'organization/profile',
            element: <OrganizationProfilePage />,
          },
          {
            path: 'organization/settings',
            element: <OrganizationSettingsPage />,
          },
          {
            path: 'branches',
            element: <BranchListPage />,
          },
          {
            path: 'branches/:id',
            element: <BranchDetailsPage />,
          },
          {
            path: 'services',
            element: <ServiceListPage />,
          },
          {
            path: 'services/:id',
            element: <ServiceDetailsPage />,
          },
          {
            path: 'counters',
            element: <CounterListPage />,
          },
          {
            path: 'counters/:id',
            element: <CounterDetailsPage />,
          },
          {
            path: 'departments',
            element: <div className="p-6 text-slate-300">Departments Setup Placeholder</div>,
          },
          {
            path: 'staff',
            element: <div className="p-6 text-slate-300">Staff Management Placeholder</div>,
          },
        ],
      },

      // Staff Dashboard Route Guard (/staff/dashboard) - STAFF, ORG_ADMIN, SUPER_ADMIN
      {
        path: '/staff',
        element: (
          <RoleProtectedRoute allowedRoles={['STAFF', 'ORG_ADMIN', 'SUPER_ADMIN']}>
            <StaffLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/staff/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <StaffDashboardPage />,
          },
        ],
      },

      // Customer Portal Route Guard (/customer) - CUSTOMER Role ONLY
      {
        path: '/customer',
        element: (
          <RoleProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout />
          </RoleProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/customer/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <CustomerDashboardPage />,
          },
          {
            path: 'get-token',
            element: <GenerateTokenPage />,
          },
          {
            path: 'token/:id',
            element: <MyTokenTrackingPage />,
          },
        ],
      },

      // Guest Only Routes (Unauthenticated Users only)
      {
        path: '/auth',
        element: (
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        ),
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },

      // Unauthorized Access Error Page
      {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
      },

      // Fallback 404 Route
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
