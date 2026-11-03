import dayjs from 'dayjs';

export const formatDate = (date: string | null | undefined, format = 'DD/MM/YYYY'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || Number.isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
