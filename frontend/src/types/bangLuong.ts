export interface ChiPhiPhatSinhDto {
  maPS: number;
  maNV: string;
  hoTen: string;
  loai: string; // Thưởng, Phạt, Ứng lương, Công tác phí
  soTien: number;
  lyDo?: string;
  thang: number;
  nam: number;
  ngayTao: string;
}

export interface CreateChiPhiPhatSinhDto {
  maNV: string;
  loai: string;
  soTien: number;
  lyDo?: string;
  thang: number;
  nam: number;
}

export interface BangLuongDto {
  maBL: number;
  maNV: string;
  hoTen: string;
  tenPB: string;
  tenCV: string;
  thang: number;
  nam: number;
  soNgayCong: number;
  luongCoBan: number;
  phuCap: number;
  khauTru: number;
  thucLinh: number;
  thuongPhatSinh?: number;
  phatKhauTru?: number;
  chiPhiPhatSinhs?: ChiPhiPhatSinhDto[];
}

export interface BangLuongFilterDto {
  thang?: number;
  nam?: number;
  maPB?: string;
}

export interface TinhLuongRequestDto {
  thang: number;
  nam: number;
}

export interface TinhLuongResultDto {
  soNhanVienTinhLuong: number;
  thang: number;
  nam: number;
}
