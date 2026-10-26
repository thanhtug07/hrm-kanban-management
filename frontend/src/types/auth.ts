export type Role = 'Admin' | 'HR' | 'NhanVien';

export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface UserProfile {
  maTK: number;
  tenDangNhap: string;
  vaiTro: Role;
  maNV: string;
  hoTen: string;
  maPB: string;
  tenPB: string;
  maCV: string;
  tenCV: string;
  email: string;
  sdt: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
  userProfile: UserProfile;
}

export interface ChangePasswordRequest {
  matKhauCu: string;
  matKhauMoi: string;
}
