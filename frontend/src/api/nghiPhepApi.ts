import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import {
  NghiPhepDto,
  CreateNghiPhepDto,
  DuyetNghiPhepDto,
} from '@/types/nghiPhep';

export const nghiPhepApi = {
  create: async (data: CreateNghiPhepDto): Promise<ApiResponse<NghiPhepDto>> => {
    return axiosClient.post('/api/nghiphep', data);
  },

  getMyLeaves: async (): Promise<ApiResponse<NghiPhepDto[]>> => {
    return axiosClient.get('/api/nghiphep/me');
  },

  getAllLeaves: async (params?: { trangThai?: string }): Promise<ApiResponse<NghiPhepDto[]>> => {
    return axiosClient.get('/api/nghiphep', { params });
  },

  duyet: async (maNP: number, data: DuyetNghiPhepDto): Promise<ApiResponse<NghiPhepDto>> => {
    return axiosClient.put(`/api/nghiphep/${maNP}/duyet`, data);
  },

  delete: async (maNP: number): Promise<ApiResponse<boolean>> => {
    return axiosClient.delete(`/api/nghiphep/${maNP}`);
  },
};
