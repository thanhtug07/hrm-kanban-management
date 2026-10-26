import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/common';
import {
  KanbanBoardDto,
  TaskItemDto,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  BinhLuanDto,
  CreateBinhLuanDto,
} from '@/types/congViec';

export const congViecApi = {
  getBoard: async (params?: {
    maNV?: string;
    doUuTien?: string;
    search?: string;
  }): Promise<ApiResponse<KanbanBoardDto>> => {
    return axiosClient.get('/api/congviec/board', { params });
  },

  getById: async (maTask: number): Promise<ApiResponse<TaskItemDto>> => {
    return axiosClient.get(`/api/congviec/${maTask}`);
  },

  create: async (data: CreateTaskDto): Promise<ApiResponse<TaskItemDto>> => {
    return axiosClient.post('/api/congviec', data);
  },

  update: async (maTask: number, data: UpdateTaskDto): Promise<ApiResponse<TaskItemDto>> => {
    return axiosClient.put(`/api/congviec/${maTask}`, data);
  },

  move: async (maTask: number, data: MoveTaskDto): Promise<ApiResponse<TaskItemDto>> => {
    return axiosClient.put(`/api/congviec/${maTask}/move`, data);
  },

  delete: async (maTask: number): Promise<ApiResponse<boolean>> => {
    return axiosClient.delete(`/api/congviec/${maTask}`);
  },

  getComments: async (maTask: number): Promise<ApiResponse<BinhLuanDto[]>> => {
    return axiosClient.get(`/api/congviec/${maTask}/binhluan`);
  },

  addComment: async (
    maTask: number,
    data: CreateBinhLuanDto
  ): Promise<ApiResponse<BinhLuanDto>> => {
    return axiosClient.post(`/api/congviec/${maTask}/binhluan`, data);
  },
};
