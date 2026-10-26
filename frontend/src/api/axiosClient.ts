import axios, { AxiosError } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5100',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// REQUEST INTERCEPTOR — Tự động gắn token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR — Xử lý lỗi toàn cục và trả về response.data
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp phần payload { success, message, data, errors }
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    console.error('API Error Response:', error.response?.data || error.message);
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/login')) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này.');
    } else if (status && status >= 500) {
      message.error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
