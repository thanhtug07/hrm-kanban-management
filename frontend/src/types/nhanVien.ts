export interface NhanVienDto {
  maNV: string;
  hoTen: string;
  gioiTinh: string;
  ngaySinh: string;
  cccd: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  maPB: string;
  tenPB: string;
  maCV: string;
  tenCV: string;
  ngayVaoLam: string;
  trangThai: string;
}

export interface CreateNhanVienDto {
  hoTen: string;
  gioiTinh: string;
  ngaySinh: string;
  cccd: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  maPB: string;
  maCV: string;
  ngayVaoLam: string;
}

export interface UpdateNhanVienDto {
  hoTen: string;
  gioiTinh: string;
  ngaySinh: string;
  cccd: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  maPB: string;
  maCV: string;
  ngayVaoLam: string;
  trangThai: string;
}

export interface NhanVienFilterDto {
  maPB?: string;
  maCV?: string;
  trangThai?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}
