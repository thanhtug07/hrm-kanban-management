import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import {
  ChamCongDto,
  ChamCongFilterDto,
  UpdateChamCongDto,
} from '@/types/chamCong';

export const chamCongApi = {
  checkIn: async (): Promise<ApiResponse<ChamCongDto>> => {
    return axiosClient.post('/api/chamcong/checkin');
  },

  checkOut: async (): Promise<ApiResponse<ChamCongDto>> => {
    return axiosClient.post('/api/chamcong/checkout');
  },

  getMe: async (thang?: number, nam?: number): Promise<ApiResponse<ChamCongDto[]>> => {
    return axiosClient.get('/api/chamcong/me', { params: { thang, nam } });
  },

  getList: async (params?: ChamCongFilterDto): Promise<ApiResponse<ChamCongDto[]>> => {
    return axiosClient.get('/api/chamcong', { params });
  },

  update: async (maCC: number, data: UpdateChamCongDto): Promise<ApiResponse<ChamCongDto>> => {
    return axiosClient.put(`/api/chamcong/${maCC}`, data);
  },
};
