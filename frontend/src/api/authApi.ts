import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/common';
import type { LoginRequest, LoginResponse, UserProfile, ChangePasswordRequest } from '@/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res: any = await axiosClient.post('/api/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const res: any = await axiosClient.get('/api/auth/me');
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<boolean>> => {
    const res: any = await axiosClient.post('/api/auth/change-password', data);
    return res;
  },
};
