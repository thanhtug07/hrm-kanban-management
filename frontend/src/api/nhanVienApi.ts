import axiosClient from './axiosClient';
import { ApiResponse, PagedResult } from '@/types/common';
import {
  NhanVienDto,
  CreateNhanVienDto,
  UpdateNhanVienDto,
  NhanVienFilterDto,
} from '@/types/nhanVien';

export const nhanVienApi = {
  getList: async (params?: NhanVienFilterDto): Promise<ApiResponse<PagedResult<NhanVienDto>>> => {
    return axiosClient.get('/api/nhanvien', { params });
  },

  getById: async (maNV: string): Promise<ApiResponse<NhanVienDto>> => {
    return axiosClient.get(`/api/nhanvien/${maNV}`);
  },

  create: async (data: CreateNhanVienDto): Promise<ApiResponse<NhanVienDto>> => {
    return axiosClient.post('/api/nhanvien', data);
  },

  update: async (maNV: string, data: UpdateNhanVienDto): Promise<ApiResponse<NhanVienDto>> => {
    return axiosClient.put(`/api/nhanvien/${maNV}`, data);
  },

  delete: async (maNV: string): Promise<ApiResponse<boolean>> => {
    return axiosClient.delete(`/api/nhanvien/${maNV}`);
  },

  search: async (query: string): Promise<ApiResponse<NhanVienDto[]>> => {
    return axiosClient.get('/api/nhanvien/search', { params: { keyword: query } });
  },
};
