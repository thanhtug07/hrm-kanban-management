export interface NghiPhepDto {
  maNP: number;
  maNV: string;
  hoTen: string;
  loaiPhep: string;
  tuNgay: string;
  denNgay: string;
  lyDo?: string;
  trangThai: string;
  maNV_Duyet?: string;
  tenNV_Duyet?: string;
  ngayDuyet?: string;
}

export interface CreateNghiPhepDto {
  loaiPhep: string;
  tuNgay: string;
  denNgay: string;
  lyDo?: string;
}

export interface DuyetNghiPhepDto {
  trangThai: 'Đã duyệt' | 'Từ chối';
  lyDoTuChoi?: string;
}
