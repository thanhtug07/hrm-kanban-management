export type TaskStatus = 'Todo' | 'InProgress' | 'Review' | 'Done';

export interface TaskItemDto {
  maTask: number;
  tieuDe: string;
  moTa?: string;
  trangThai: TaskStatus;
  viTri: number;
  doUuTien: string;
  ngayBatDau?: string;
  deadline?: string;
  ngayHoanThanh?: string;
  maNV_PhuTrach: string;
  tenNV_PhuTrach: string;
  maNV_Giao: string;
  tenNV_Giao: string;
  ngayTao: string;
  ngayCapNhat?: string;
  laQuaHan: boolean;
  soBinhLuan: number;
}

export interface KanbanBoardDto {
  todo: TaskItemDto[];
  inProgress: TaskItemDto[];
  review: TaskItemDto[];
  done: TaskItemDto[];
  totalTasks: number;
  overdueTasks: number;
}

export interface CreateTaskDto {
  tieuDe: string;
  moTa?: string;
  maNV_PhuTrach: string;
  doUuTien: string;
  ngayBatDau?: string;
  deadline?: string;
}

export interface UpdateTaskDto {
  tieuDe: string;
  moTa?: string;
  maNV_PhuTrach: string;
  doUuTien: string;
  ngayBatDau?: string;
  deadline?: string;
}

export interface MoveTaskDto {
  trangThaiMoi: string;
  maTaskTruoc?: number | null;
  maTaskSau?: number | null;
}

export interface BinhLuanDto {
  maBL: number;
  maTask: number;
  maNV: string;
  hoTen: string;
  noiDung: string;
  thoiGian: string;
}

export interface CreateBinhLuanDto {
  noiDung: string;
}
