import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import AdminDashboard from './AdminDashboard';
import MyDashboard from './MyDashboard';

export const RoleDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isHrOrAdmin = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  return isHrOrAdmin ? <AdminDashboard /> : <MyDashboard />;
};

export default RoleDashboard;
