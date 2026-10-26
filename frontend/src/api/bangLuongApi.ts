import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import {
  BangLuongDto,
  TinhLuongRequestDto,
  TinhLuongResultDto,
  ChiPhiPhatSinhDto,
  CreateChiPhiPhatSinhDto,
} from '@/types/bangLuong';

export const bangLuongApi = {
  tinhLuong: async (data: TinhLuongRequestDto): Promise<ApiResponse<TinhLuongResultDto>> => {
    return axiosClient.post('/api/bangluong/tinhluong', data);
  },

  getList: async (params?: {
    thang?: number;
    nam?: number;
    maPB?: string;
  }): Promise<ApiResponse<BangLuongDto[]>> => {
    return axiosClient.get('/api/bangluong', { params });
  },

  getMyPayroll: async (params?: { nam?: number }): Promise<ApiResponse<BangLuongDto[]>> => {
    return axiosClient.get('/api/bangluong/me', { params });
  },

  getById: async (maBL: number): Promise<ApiResponse<BangLuongDto>> => {
    return axiosClient.get(`/api/bangluong/${maBL}`);
  },

  getDetail: async (maNV: string, thang: number, nam: number): Promise<ApiResponse<BangLuongDto>> => {
    return axiosClient.get(`/api/bangluong/${maNV}/${thang}/${nam}`);
  },

  createPhatSinh: async (data: CreateChiPhiPhatSinhDto): Promise<ApiResponse<ChiPhiPhatSinhDto>> => {
    return axiosClient.post('/api/bangluong/phatsinh', data);
  },

  getPhatSinhList: async (params?: {
    maNV?: string;
    thang?: number;
    nam?: number;
  }): Promise<ApiResponse<ChiPhiPhatSinhDto[]>> => {
    return axiosClient.get('/api/bangluong/phatsinh', { params });
  },
};
