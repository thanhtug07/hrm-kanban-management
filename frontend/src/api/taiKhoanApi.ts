import axiosClient from './axiosClient';
import { ApiResponse, PagedResult } from '@/types/common';
import {
  TaiKhoanDto,
  CreateTaiKhoanDto,
  UpdateTaiKhoanDto,
  UpdateTrangThaiDto,
  ResetPasswordDto,
} from '@/types/taiKhoan';

export const taiKhoanApi = {
  // Backend trả về PagedResult (không phải mảng). Lấy 1 trang lớn vì trang này lọc phía client.
  getAll: async (): Promise<ApiResponse<PagedResult<TaiKhoanDto>>> => {
    return axiosClient.get('/api/taikhoan', { params: { page: 1, pageSize: 100 } });
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
