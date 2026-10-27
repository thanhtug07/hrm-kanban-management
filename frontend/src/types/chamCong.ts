export interface ChamCongDto {
  maCC: number;
  maNV: string;
  hoTen: string;
  tenPhongBan?: string;
  ngay: string;
  gioVao?: string;
  gioRa?: string;
  trangThai: string;
}

export interface ChamCongFilterDto {
  maNV?: string;
  maPB?: string;
  thang?: number;
  nam?: number;
  trangThai?: string;
}

export interface UpdateChamCongDto {
  gioVao?: string;
  gioRa?: string;
  trangThai: string;
}

export interface CauHinhChamCongDto {
  maCH: number;
  gioBatDau: string;
  gioKetThuc: string;
  phutChoPhepSom: number;
  phutChoPhepTre: number;
  batBuocCheckOutSauKetThuc: boolean;
  ngayCapNhat: string;
}

export interface UpdateCauHinhChamCongDto {
  gioBatDau: string;
  gioKetThuc: string;
  phutChoPhepSom: number;
  phutChoPhepTre: number;
  batBuocCheckOutSauKetThuc: boolean;
}