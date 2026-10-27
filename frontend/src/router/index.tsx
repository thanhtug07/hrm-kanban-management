import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy-load các trang (code splitting) — giảm bundle ban đầu
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const RoleDashboard = lazy(() => import('@/pages/dashboard/RoleDashboard'));
const KanbanBoardPage = lazy(() => import('@/pages/kanban/KanbanBoardPage'));
const NhanVienListPage = lazy(() => import('@/pages/nhanvien/NhanVienListPage'));
const ChamCongPage = lazy(() => import('@/pages/chamcong/ChamCongPage'));
const NghiPhepPage = lazy(() => import('@/pages/nghiphep/NghiPhepPage'));
const BangLuongPage = lazy(() => import('@/pages/bangluong/BangLuongPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const TaiKhoanPage = lazy(() => import('@/pages/taikhoan/TaiKhoanPage'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" tip="Đang tải...">
      <div style={{ padding: 24 }} />
    </Spin>
  </div>
);

const withSuspense = (node: React.ReactNode) => <Suspense fallback={<Loading />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/403',
    element: withSuspense(<ForbiddenPage />),
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
        element: withSuspense(<RoleDashboard />),
      },
      {
        path: 'kanban',
        element: withSuspense(<KanbanBoardPage />),
      },
      {
        path: 'nhanvien',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'HR', 'TruongPhong']}>
            {withSuspense(<NhanVienListPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'taikhoan',
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            {withSuspense(<TaiKhoanPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'chamcong',
        element: withSuspense(<ChamCongPage />),
      },
      {
        path: 'nghiphep',
        element: withSuspense(<NghiPhepPage />),
      },
      {
        path: 'bangluong',
        element: withSuspense(<BangLuongPage />),
      },
      {
        path: 'profile',
        element: withSuspense(<ProfilePage />),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);

export default router;
