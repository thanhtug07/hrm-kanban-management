/**
 * api-fuzz.test.js — Kiểm tra validate đầu vào (fuzz) + nghiệp vụ biên.
 * Chạy: node suites/api-fuzz.test.js
 */
const { request } = require('playwright-core');
const { Runner, config } = require('../helpers');

(async () => {
  const r = new Runner('API FUZZ');
  console.log('\n=== API FUZZ / VALIDATION TEST ===\n');

  const api = await request.newContext();
  const login = async (u, p) => (await (await api.post(config.API + '/api/auth/login', { data: { tenDangNhap: u, matKhau: p } })).json())?.data?.token;
  const adminTok = await login('admin', 'Admin@123');
  const nvTok = await login('nv001', 'Nv@123');
  const H = { Authorization: 'Bearer ' + adminTok };
  const rnd = () => String(Date.now()).slice(-12).padStart(12, '0');
  const is4xx = (s) => s >= 400 && s < 500;

  // ===== Nhân viên =====
  console.log('  -- Nhân viên --');
  r.check('CCCD sai định dạng -> 4xx', is4xx((await api.post(config.API + '/api/nhanvien', { headers: H, data: { hoTen: 'X', gioiTinh: 'Nam', ngaySinh: '1995-01-01', cccd: 'ABC', maPB: 'PB001', maCV: 'CV004', ngayVaoLam: '2024-01-01' } })).status()));
  r.check('Họ tên rỗng -> 4xx', is4xx((await api.post(config.API + '/api/nhanvien', { headers: H, data: { hoTen: '', gioiTinh: 'Nam', ngaySinh: '1995-01-01', cccd: rnd(), maPB: 'PB001', maCV: 'CV004' } })).status()));
  r.check('Ngày sinh tương lai -> 4xx', is4xx((await api.post(config.API + '/api/nhanvien', { headers: H, data: { hoTen: 'X', gioiTinh: 'Nam', ngaySinh: '2099-01-01', cccd: rnd(), maPB: 'PB001', maCV: 'CV004', ngayVaoLam: '2024-01-01' } })).status()));
  r.check('Phòng ban không tồn tại -> 4xx', is4xx((await api.post(config.API + '/api/nhanvien', { headers: H, data: { hoTen: 'X', gioiTinh: 'Nam', ngaySinh: '1995-01-01', cccd: rnd(), maPB: 'PB999', maCV: 'CV004', ngayVaoLam: '2024-01-01' } })).status()));

  // ===== Task =====
  console.log('  -- Task Kanban --');
  r.check('Tiêu đề rỗng -> 4xx', is4xx((await api.post(config.API + '/api/congviec', { headers: H, data: { tieuDe: '', maNV_PhuTrach: 'NV006', doUuTien: 'Cao' } })).status()));
  r.check('NV không tồn tại -> 4xx', is4xx((await api.post(config.API + '/api/congviec', { headers: H, data: { tieuDe: 'X', maNV_PhuTrach: 'NV999', doUuTien: 'Cao' } })).status()));
  r.check('Ưu tiên sai -> 4xx', is4xx((await api.post(config.API + '/api/congviec', { headers: H, data: { tieuDe: 'X', maNV_PhuTrach: 'NV006', doUuTien: 'SAI' } })).status()));
  r.check('Deadline < ngày bắt đầu -> 4xx', is4xx((await api.post(config.API + '/api/congviec', { headers: H, data: { tieuDe: 'X', maNV_PhuTrach: 'NV006', doUuTien: 'Cao', ngayBatDau: '2026-12-01', deadline: '2026-11-01' } })).status()));

  // ===== Phát sinh lương =====
  console.log('  -- Phát sinh lương --');
  r.check('Số tiền âm -> chặn', is4xx((await api.post(config.API + '/api/bangluong/phatsinh', { headers: H, data: { maNV: 'NV006', loai: 'Thưởng', soTien: -1000, thang: 10, nam: 2026 } })).status()));
  r.check('Loại sai -> 4xx', is4xx((await api.post(config.API + '/api/bangluong/phatsinh', { headers: H, data: { maNV: 'NV006', loai: 'SAI', soTien: 1000, thang: 10, nam: 2026 } })).status()));
  r.check('Tháng 13 -> 4xx', is4xx((await api.post(config.API + '/api/bangluong/phatsinh', { headers: H, data: { maNV: 'NV006', loai: 'Thưởng', soTien: 1000, thang: 13, nam: 2026 } })).status()));

  // ===== Nghỉ phép =====
  console.log('  -- Nghỉ phép --');
  const nvH = { Authorization: 'Bearer ' + nvTok };
  r.check('Đơn nghỉ ngày quá khứ -> chặn', is4xx((await api.post(config.API + '/api/nghiphep', { headers: nvH, data: { loaiPhep: 'Phép năm', tuNgay: '2020-01-01', denNgay: '2020-01-02' } })).status()));
  r.check('Đơn nghỉ ĐếnNgày < TừNgày -> 4xx', is4xx((await api.post(config.API + '/api/nghiphep', { headers: nvH, data: { loaiPhep: 'Phép năm', tuNgay: '2026-12-10', denNgay: '2026-12-01' } })).status()));

  // ===== Phân trang =====
  console.log('  -- Phân trang --');
  const bigPage = await (await api.get(config.API + '/api/nhanvien?pageSize=999999', { headers: H })).json();
  const cnt = bigPage?.data?.items?.length || 0;
  r.check('pageSize=999999 bị cap (<=100)', cnt <= 100, `trả về ${cnt} item`);

  await api.dispose();
  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();
