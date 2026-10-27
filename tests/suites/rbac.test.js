/**
 * rbac.test.js — Kiểm tra phân quyền theo vai trò (RBAC + IDOR).
 * Chạy: node suites/rbac.test.js
 */
const { request } = require('playwright-core');
const { Runner, launchBrowser, login, sleep, config } = require('../helpers');

(async () => {
  const r = new Runner('RBAC');
  console.log('\n=== RBAC / PHÂN QUYỀN TEST ===\n');

  const api = await request.newContext();
  const token = async (u, p) => {
    const res = await api.post(config.API + '/api/auth/login', { data: { tenDangNhap: u, matKhau: p } });
    return (await res.json())?.data?.token;
  };

  const adminTok = await token('admin', 'Admin@123');
  const hrTok = await token('hr01', 'Hr@123');
  const nvTok = await token('nv001', 'Nv@123');
  const H = (t) => ({ Authorization: 'Bearer ' + t });

  // ==== API level ====
  // Không token
  r.check('Không token -> 401', (await api.get(config.API + '/api/nhanvien')).status() === 401);

  // NV không được xem dashboard tổng
  r.check('NV xem dashboard tổng -> 403', (await api.get(config.API + '/api/dashboard', { headers: H(nvTok) })).status() === 403);

  // nv001 gắn NV006 -> thử xem lương NV007 (người khác)
  r.check('NV xem lương người khác -> 403', (await api.get(config.API + '/api/bangluong/NV007/10/2026', { headers: H(nvTok) })).status() === 403);

  // nv001 gắn NV006 -> thử xem hồ sơ NV007 (người khác)
  r.check('NV xem hồ sơ người khác -> 403/chặn', (await api.get(config.API + '/api/nhanvien/NV007', { headers: H(nvTok) })).status() === 403);

  // HR KHÔNG được tính lương (chỉ Admin)
  const hrTinhLuong = await api.post(config.API + '/api/bangluong/tinhluong', { headers: H(hrTok), data: { thang: 10, nam: 2026 } });
  r.check('HR tính lương -> 403 (chỉ Admin)', hrTinhLuong.status() === 403, `status=${hrTinhLuong.status()}`);

  // HR KHÔNG được gán vai trò Admin (leo thang đặc quyền)
  const hrSetAdmin = await api.post(config.API + '/api/taikhoan', { headers: H(hrTok), data: { tenDangNhap: 'hack_' + Date.now(), matKhau: 'Test@12345', vaiTro: 'Admin' } });
  r.check('HR tạo tài khoản Admin -> 403', hrSetAdmin.status() === 403, `status=${hrSetAdmin.status()}`);

  // HR gán 'Admin ' (khoảng trắng) -> chặn
  const accList = await (await api.get(config.API + '/api/taikhoan', { headers: H(hrTok) })).json();
  const nvAcc = accList?.data?.items?.find((a) => a.vaiTro === 'NhanVien');
  if (nvAcc) {
    const hrSetAdminSpace = await api.put(config.API + `/api/taikhoan/${nvAcc.maTK}`, { headers: H(hrTok), data: { vaiTro: 'Admin ' } });
    r.check('HR gán vai trò "Admin " -> chặn', hrSetAdminSpace.status() === 403 || hrSetAdminSpace.status() === 400, `status=${hrSetAdminSpace.status()}`);
  }

  // Admin tạo tài khoản Admin -> OK
  const adminCreate = await api.post(config.API + '/api/taikhoan', { headers: H(adminTok), data: { tenDangNhap: 'ok_' + Date.now(), matKhau: 'Test@12345', vaiTro: 'Admin' } });
  r.check('Admin tạo tài khoản Admin -> 200', adminCreate.status() === 200 || adminCreate.status() === 201, `status=${adminCreate.status()}`);

  // ==== UI level ====
  const { browser, page } = await launchBrowser();
  try {
    await login(page, 'nv001', 'Nv@123');
    const menu = (await page.locator('.hrm-sider .ant-menu').allInnerTexts()).join('\n');
    r.check('NV ẩn menu "Quản lý tài khoản"', !/Quản lý tài khoản/i.test(menu));
    r.check('NV ẩn menu "Quản lý Nhân viên"', !/Quản lý Nhân viên/i.test(menu));

    await page.goto(config.FRONTEND + '/taikhoan', { waitUntil: 'networkidle' }); await sleep(1200);
    r.check('NV truy cập /taikhoan -> 403', page.url().includes('/403'), page.url());

    await page.goto(config.FRONTEND + '/nhanvien', { waitUntil: 'networkidle' }); await sleep(1200);
    r.check('NV truy cập /nhanvien -> 403', page.url().includes('/403'), page.url());

    // HR thấy nút cần thiết
    await login(page, 'hr01', 'Hr@123');
    await page.goto(config.FRONTEND + '/bangluong', { waitUntil: 'networkidle' }); await sleep(1800);
    const hrBtn = await page.getByRole('button', { name: /Tính Lương/i }).count();
    r.check('HR KHÔNG thấy nút Tính Lương', hrBtn === 0, `count=${hrBtn}`);
  } catch (e) {
    r.fail('Lỗi script UI', e.message);
  }
  await browser.close();
  await api.dispose();

  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();