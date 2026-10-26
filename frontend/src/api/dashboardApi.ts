import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import { DashboardDto, DashboardCaNhanDto } from '@/types/dashboard';

export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse<DashboardDto>> => {
    return axiosClient.get('/api/dashboard');
  },

  getMyDashboard: async (): Promise<ApiResponse<DashboardCaNhanDto>> => {
    return axiosClient.get('/api/dashboard/me');
  },
};
