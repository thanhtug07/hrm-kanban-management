import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RoleDashboard from '@/pages/dashboard/RoleDashboard';
import KanbanBoardPage from '@/pages/kanban/KanbanBoardPage';
import NhanVienListPage from '@/pages/nhanvien/NhanVienListPage';
import ChamCongPage from '@/pages/chamcong/ChamCongPage';
import NghiPhepPage from '@/pages/nghiphep/NghiPhepPage';
import BangLuongPage from '@/pages/bangluong/BangLuongPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import TaiKhoanPage from '@/pages/taikhoan/TaiKhoanPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <RoleDashboard />,
      },
      {
        path: 'kanban',
        element: <KanbanBoardPage />,
      },
      {
        path: 'nhanvien',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <NhanVienListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'taikhoan',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <TaiKhoanPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chamcong',
        element: <ChamCongPage />,
      },
      {
        path: 'nghiphep',
        element: <NghiPhepPage />,
      },
      {
        path: 'bangluong',
        element: <BangLuongPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
