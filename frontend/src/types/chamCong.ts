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
