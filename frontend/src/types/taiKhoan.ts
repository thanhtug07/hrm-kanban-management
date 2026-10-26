export interface TaiKhoanDto {
  maTK: number;
  tenDangNhap: string;
  vaiTro: 'Admin' | 'HR' | 'NhanVien' | string;
  maNV?: string | null;
  hoTen?: string | null;
  tenPB?: string | null;
  tenCV?: string | null;
  email?: string | null;
  trangThai: boolean;
  ngayTao: string;
}

export interface CreateTaiKhoanDto {
  maNV?: string | null; // Tùy ý: có thể chọn hoặc không cần có trong DS công ty
  tenDangNhap: string;
  matKhau: string;
  vaiTro: string;
}

export interface UpdateTaiKhoanDto {
  tenDangNhap?: string; // Sửa tên đăng nhập tùy ý
  matKhauMoi?: string;  // Sửa mật khẩu tùy ý
  vaiTro?: string;      // Admin | HR | NhanVien
  maNV?: string | null;
}

export interface UpdateTrangThaiDto {
  trangThai: boolean;
}

export interface ResetPasswordDto {
  matKhauMoi?: string;
}
