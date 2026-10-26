import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import {
  TaiKhoanDto,
  CreateTaiKhoanDto,
  UpdateTaiKhoanDto,
  UpdateTrangThaiDto,
  ResetPasswordDto,
} from '@/types/taiKhoan';

export const taiKhoanApi = {
  getAll: async (): Promise<ApiResponse<TaiKhoanDto[]>> => {
    return axiosClient.get('/api/taikhoan');
  },

  create: async (data: CreateTaiKhoanDto): Promise<ApiResponse<TaiKhoanDto>> => {
    return axiosClient.post('/api/taikhoan', data);
  },

  update: async (
    id: number,
    data: UpdateTaiKhoanDto
  ): Promise<ApiResponse<TaiKhoanDto>> => {
    return axiosClient.put(`/api/taikhoan/${id}`, data);
  },

  updateStatus: async (
    id: number,
    data: UpdateTrangThaiDto
  ): Promise<ApiResponse<boolean>> => {
    return axiosClient.put(`/api/taikhoan/${id}/trangthai`, data);
  },

  resetPassword: async (
    id: number,
    data: ResetPasswordDto
  ): Promise<ApiResponse<boolean>> => {
    return axiosClient.put(`/api/taikhoan/${id}/reset-password`, data);
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return axiosClient.delete(`/api/taikhoan/${id}`);
  },
};
