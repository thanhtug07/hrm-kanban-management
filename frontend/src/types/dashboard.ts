export interface DashboardDto {
  tongNhanVien: number;
  nhanVienDangLam: number;
  nhanVienNghiViec: number;
  taskQuaHan: number;
  taskHoanThanhThangNay: number;
  donNghiPhepChoDuyet: number;
  nhanSuTheoPhongBan: NhanSuTheoPhongBanItem[];
  topNhanVienNhieuTask: TopNhanVienItem[];
}

export interface NhanSuTheoPhongBanItem {
  maPB: string;
  tenPB: string;
  soLuong: number;
}

export interface TopNhanVienItem {
  maNV: string;
  hoTen: string;
  soTask: number;
}

export interface DashboardCaNhanDto {
  taskCuaToi: {
    todo: number;
    inProgress: number;
    done: number;
    quaHan: number;
  };
  donNghiPhepCuaToi: {
    choDuyet: number;
    daDuyet: number;
  };
  chamCongThangNay: {
    soNgayCong: number;
    soLanTre: number;
  };
  luongThangGanNhat?: {
    thang: number;
    nam: number;
    thucLinh: number;
  } | null;
}
