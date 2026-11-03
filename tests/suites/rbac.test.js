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

  // HR KHÔNG được xem bảng lương toàn công ty (ẩn UI + chặn ở server)
  const hrList = await api.get(config.API + '/api/bangluong', { headers: H(hrTok) });
  r.check('HR GET /api/bangluong (toàn công ty) -> 403', hrList.status() === 403, `status=${hrList.status()}`);

  // Admin xem được bảng lương toàn công ty
  const adminList = await api.get(config.API + '/api/bangluong', { headers: H(adminTok) });
  r.check('Admin GET /api/bangluong -> 200', adminList.status() === 200, `status=${adminList.status()}`);

  // HR KHÔNG được tính lương (chỉ Admin)
  const hrTinhLuong = await api.post(config.API + '/api/bangluong/tinhluong', { headers: H(hrTok), data: { thang: 10, nam: 2026 } });
  r.check('HR tính lương -> 403 (chỉ Admin)', hrTinhLuong.status() === 403, `status=${hrTinhLuong.status()}`);

  // HR KHÔNG được gán vai trò Admin (leo thang đặc quyền)
  const hrSetAdmin = await api.post(config.API + '/api/taikhoan', { headers: H(hrTok), data: { tenDangNhap: 'hack_' + Date.now(), matKhau: 'Test@12345', vaiTro: 'Admin' } });
  r.check('HR quản lý tài khoản -> 403 (chỉ Admin)', hrSetAdmin.status() === 403, `status=${hrSetAdmin.status()}`);

  // HR gán 'Admin ' (khoảng trắng) -> chặn
  // HR bi chan hoan toan khoi quan ly tai khoan (chi Admin)
  const hrGetAcc = await api.get(config.API + '/api/taikhoan', { headers: H(hrTok) });
  r.check('HR GET /api/taikhoan -> 403', hrGetAcc.status() === 403, `status=${hrGetAcc.status()}`);

  // Nhân viên tự xem được phiếu lương của mình nhưng không xem được toàn công ty
  const nvMine = await api.get(config.API + '/api/bangluong/me', { headers: H(nvTok) });
  r.check('NV xem lương của mình -> 200', nvMine.status() === 200, `status=${nvMine.status()}`);

  // Admin tạo tài khoản Admin -> OK (tạo xong phải xóa, tránh làm bẩn dữ liệu seed)
  const adminCreate = await api.post(config.API + '/api/taikhoan', { headers: H(adminTok), data: { tenDangNhap: 'ok_' + Date.now(), matKhau: 'Test@12345', vaiTro: 'Admin' } });
  r.check('Admin tạo tài khoản Admin -> 200', adminCreate.status() === 200 || adminCreate.status() === 201, `status=${adminCreate.status()}`);
  const createdId = (await adminCreate.json().catch(() => null))?.data?.maTK;
  if (createdId) {
    const del = await api.delete(config.API + '/api/taikhoan/' + createdId, { headers: H(adminTok) });
    r.check('Dọn tài khoản test -> 200', del.status() === 200, `status=${del.status()}`);
  }

  // ==== UI level ====
  const { browser, page } = await launchBrowser();
  try {
    await login(page, 'nv001', 'Nv@123');
    // Lấy nhãn menu bằng cách đọc trực tiếp .ant-menu-item (tránh .allInnerTexts() trả rỗng)
    const readMenu = async () => (await page.evaluate(() =>
      [...document.querySelectorAll('.hrm-sider .ant-menu-item')].map((e) => e.innerText.trim())
    )).join('\n');
    await page.waitForSelector('.hrm-sider .ant-menu-item', { timeout: 15000 }).catch(() => {});
    const menu = await readMenu();
    r.check('NV ẩn menu "Quản lý tài khoản"', !/Quản lý tài khoản/i.test(menu), menu.replace(/\n/g, ' / '));
    r.check('NV ẩn menu "Quản lý Nhân viên"', !/Quản lý Nhân viên/i.test(menu));
    r.check('NV vẫn thấy menu "Bảng lương & Chi trả" (xem phiếu của mình)', /Bảng lương/i.test(menu));

    await page.goto(config.FRONTEND + '/taikhoan', { waitUntil: 'networkidle' }); await sleep(1200);
    r.check('NV truy cập /taikhoan -> 403', page.url().includes('/403'), page.url());

    await page.goto(config.FRONTEND + '/nhanvien', { waitUntil: 'networkidle' }); await sleep(1200);
    r.check('NV truy cập /nhanvien -> 403', page.url().includes('/403'), page.url());

    // HR: KHÔNG có quyền xem Bảng lương & Chi trả (đã ẩn khỏi menu + chặn route)
    await login(page, 'hr01', 'Hr@123');
    await page.waitForSelector('.hrm-sider .ant-menu-item', { timeout: 15000 }).catch(() => {});
    const hrMenu = await readMenu();
    r.check('HR ẩn menu "Bảng lương & Chi trả"', !/Bảng lương/i.test(hrMenu), hrMenu.replace(/\n/g, ' / '));
    r.check('HR ẩn menu "Quản lý tài khoản"', !/Quản lý tài khoản/i.test(hrMenu));
    r.check('HR vẫn thấy menu "Quản lý Nhân viên"', /Quản lý Nhân viên/i.test(hrMenu));

    await page.goto(config.FRONTEND + '/bangluong', { waitUntil: 'networkidle' }); await sleep(1800);
    r.check('HR truy cập /bangluong -> 403', page.url().includes('/403'), page.url());

    // Trang lương của nhân viên không có nút Tính Lương (chỉ Admin)
    await login(page, 'nv001', 'Nv@123');
    await page.goto(config.FRONTEND + '/bangluong', { waitUntil: 'networkidle' }); await sleep(1800);
    const hrBtn = await page.getByRole('button', { name: /Tính Lương/i }).count();
    r.check('Nhân viên KHÔNG thấy nút Tính Lương', hrBtn === 0, `count=${hrBtn}`);
  } catch (e) {
    r.fail('Lỗi script UI', e.message);
  }
  await browser.close();
  await api.dispose();

  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();
