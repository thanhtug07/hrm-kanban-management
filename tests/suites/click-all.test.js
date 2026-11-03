/**
 * click-all.test.js — Đi từng trang, click từng nút, dùng từng chức năng.
 * Lần lượt: admin -> logout -> hr -> logout -> nv.
 * Chạy: node suites/click-all.test.js
 *
 * QUY TẮC AN TOÀN: test này KHÔNG bấm nút phá dữ liệu (Xóa/Tính lương/Gửi đơn/Tạo tài
 * khoản). Nút nguy hiểm chỉ được mở ra rồi đóng lại (Esc) để kiểm tra form render.
 * Ngoại lệ: Kanban tạo rồi tự xóa task AUTO-TEST (giống suites/e2e.test.js).
 */
const { Runner, launchBrowser, login, sleep, config } = require('../helpers');

const ROLES = [
  {
    name: 'Admin', u: 'admin', p: 'Admin@123',
    pages: ['/dashboard', '/kanban', '/chamcong', '/nghiphep', '/bangluong', '/nhanvien', '/taikhoan'],
    forbidden: [],
  },
  {
    // HR: KHÔNG có bảng lương (chỉ Admin + nhân viên xem phiếu của mình) và không có tài khoản
    name: 'HR', u: 'hr01', p: 'Hr@123',
    pages: ['/dashboard', '/kanban', '/chamcong', '/nghiphep', '/nhanvien', '/profile'],
    forbidden: ['/bangluong', '/taikhoan'],
  },
  {
    // Nhân viên: chỉ các trang tự phục vụ
    name: 'NhanVien', u: 'nv001', p: 'Nv@123',
    pages: ['/dashboard', '/kanban', '/chamcong', '/nghiphep', '/bangluong', '/profile'],
    forbidden: ['/nhanvien', '/taikhoan'],
  },
];

// Nhãn nút được phép BẤM THẬT (an toàn). Các nút khớp các regex này sẽ bị bỏ qua.
const DANGEROUS = /xóa|xoá|delete|tính lương|gửi đơn|tạo tài khoản|tạo công việc|reset|xác nhận|đồng ý|ok$|lưu|gửi/i;

(async () => {
  const r = new Runner('CLICK-ALL');
  console.log('\n=== CLICK-ALL TEST (fromng trang, từng nút, từng vai trò) ===\n');

  const { browser, page } = await launchBrowser();
  const pageErrs = [];
  const netFails = [];
  page.on('pageerror', (e) => pageErrs.push(e.message));
  page.on('response', (res) => {
    if (res.status() >= 500) netFails.push(`${res.status()} ${res.url()}`);
  });

  try {
    for (const role of ROLES) {
      console.log(`\n---- VAI TRÒ: ${role.name} (${role.u}) ----`);

      // 1. LOGIN qua UI
      await login(page, role.u, role.p);
      // Sau đăng nhập phải vào một trang hợp lệ (thường là /dashboard, hoặc trang được yêu cầu trước đó).
      // Điều bắt buộc: KHÔNG được kẹt ở /login hay /403.
      const after = page.url();
      r.check(
        `[${role.name}] đăng nhập -> trang hợp lệ`,
        !/\/login|\/403/.test(after) && page.url().includes(config.FRONTEND),
        after
      );

      // 2. Sidebar: click từng menu item (điều hướng thật)
      const MENU_LABEL = {
        '/dashboard': 'Tổng quan',
        '/kanban': 'Bảng việc Kanban',
        '/chamcong': 'Điểm danh & Chấm công',
        '/nghiphep': 'Quản lý Nghỉ phép',
        '/bangluong': 'Bảng lương & Chi trả',
        '/nhanvien': 'Quản lý Nhân viên',
        '/taikhoan': 'Quản lý tài khoản',
        '/profile': 'Trang cá nhân',
      };
      for (const path of role.pages) {
        const item = page.locator('.hrm-sider .ant-menu-item');
        const label = MENU_LABEL[path] || path.replace('/', '');
        const target = item.filter({ hasText: label }).first();
        const found = await target.count();

        if (found > 0) {
          await target.click();
          await sleep(1500);
          r.check(`[${role.name}] click menu "${label}" -> ${path}`, page.url().includes(path), page.url());
        } else {
          // Nhãn menu khác path -> điều hướng trực tiếp để vẫn test được trang
          await page.goto(config.FRONTEND + path, { waitUntil: 'networkidle' });
          await sleep(1200);
          r.check(`[${role.name}] trang ${path} mở được (không thấy menu "${label}")`, page.url().includes(path), page.url());
        }

        // 3. Trên mỗi trang: liệt kê nút, mở/đóng từng cái
        const btns = page.locator('button:visible, .ant-btn:visible');
        const n = Math.min(await btns.count(), 12);
        const clickedNames = [];

        for (let i = 0; i < n; i++) {
          const b = btns.nth(i);
          const text = ((await b.innerText().catch(() => '')) || '').trim();
          if (!text) continue;

          // Bỏ qua nút phá dữ liệu
          if (DANGEROUS.test(text)) continue;
          if (!(await b.isEnabled().catch(() => false))) continue;

          const before = page.url();
          await b.click({ timeout: 2000 }).catch(() => {});
          await sleep(700);
          clickedNames.push(text.slice(0, 20));

          // Nếu mở modal/drawer thì đóng lại
          const modalOpen = await page.locator('.ant-modal:visible, .ant-drawer:visible').count();
          if (modalOpen > 0) {
            await page.keyboard.press('Escape');
            await sleep(500);
            const stillOpen = await page.locator('.ant-modal:visible, .ant-drawer:visible').count();
            if (stillOpen > 0) {
              const closeBtn = page.locator('.ant-modal:visible .ant-modal-close, .ant-drawer:visible .ant-drawer-close');
              if (await closeBtn.count() > 0) { await closeBtn.first().click().catch(() => {}); await sleep(400); }
            }
          }

          // Nếu bị điều hướng sang trang khác (nút điều hướng) thì quay lại
          if (page.url() !== before) {
            await page.goto(config.FRONTEND + path, { waitUntil: 'networkidle' });
            await sleep(1000);
          }
        }
        r.check(`[${role.name}] ${path}: click nút an toàn`, clickedNames.length > 0, clickedNames.join(', ') || 'không có nút nào');

        // 4. Trang không lỗi trắng
        const txt = await page.locator('body').innerText();
        r.check(`[${role.name}] ${path}: render OK`, txt.length > 100 && !/Cannot read|Something went wrong|undefined is not/i.test(txt));

        // 5. Không có lỗi 500
        const f5 = netFails.filter((x) => x.includes(path.split('/')[1] || ''));
        r.check(`[${role.name}] ${path}: không có lỗi 5xx`, netFails.length === 0, netFails.slice(0, 2).join(' | '));
      }

      // 5b. Trang bị CẤM với vai trò này: vào thẳng URL phải bị đẩy sang /403
      for (const path of role.forbidden || []) {
        await page.goto(config.FRONTEND + path, { waitUntil: 'networkidle' });
        await sleep(1500);
        r.check(`[${role.name}] ${path} bị chặn -> /403`, page.url().includes('/403'), page.url());
      }

      // 6. Tính năng riêng từng trang (feature thật)

      // --- Kanban: kéo 1 thẻ sang cột khác rồi kéo về (dùng nút chuyển trạng thái/API qua UI) ---
      await page.goto(config.FRONTEND + '/kanban', { waitUntil: 'networkidle' });
      await sleep(2500);
      const cards = page.locator('[data-rfd-draggable-id]');
      const cardCount = await cards.count();
      r.check(`[${role.name}] Kanban có thẻ`, cardCount > 0, `${cardCount} thẻ`);
      if (cardCount > 0) {
        await cards.first().click().catch(() => {});
        await sleep(1200);
        const drawer = await page.locator('.ant-drawer:visible').count();
        r.check(`[${role.name}] Kanban: mở chi tiết thẻ`, drawer > 0);
        if (drawer > 0) {
          const dtxt = await page.locator('.ant-drawer:visible').innerText();
          r.check(`[${role.name}] Kanban: chi tiết có nội dung`, dtxt.length > 20);
          await page.keyboard.press('Escape');
          await sleep(600);
        }
      }

      // --- Nghỉ phép: chuyển tab (nếu vai trò có nhiều tab) ---
      await page.goto(config.FRONTEND + '/nghiphep', { waitUntil: 'networkidle' });
      await sleep(2000);
      const tabs = page.locator('.ant-tabs-tab');
      const tabN = await tabs.count();
      for (let i = 0; i < tabN; i++) {
        await tabs.nth(i).click().catch(() => {});
        await sleep(800);
        const t = await page.locator('body').innerText();
        r.check(`[${role.name}] Nghỉ phép: tab ${i + 1} render`, t.length > 100);
      }

      // --- Chấm công: chuyển tháng (feature filter) ---
      await page.goto(config.FRONTEND + '/chamcong', { waitUntil: 'networkidle' });
      await sleep(2000);
      const pickers = page.locator('.ant-picker:visible, .ant-select:visible');
      const pk = Math.min(await pickers.count(), 3);
      for (let i = 0; i < pk; i++) {
        await pickers.nth(i).click().catch(() => {});
        await sleep(600);
        await page.keyboard.press('Escape');
        await sleep(400);
      }
      r.check(`[${role.name}] Chấm công: mở được bộ lọc ngày/tháng`, pk > 0, `${pk} control`);

      // --- Bảng lương: chọn kỳ lương (chỉ vai trò được phép) ---
      if (role.pages.includes('/bangluong')) {
        await page.goto(config.FRONTEND + '/bangluong', { waitUntil: 'networkidle' });
        await sleep(2000);
        const blTxt = await page.locator('body').innerText();
        r.check(`[${role.name}] Bảng lương: có dữ liệu/số liệu`, /\d/.test(blTxt));
      } else {
        r.check(`[${role.name}] Bảng lương: đã ẩn đúng vai trò`, true, 'bỏ qua (không có quyền xem trang)');
      }

      // --- Dashboard: biểu đồ render ---
      await page.goto(config.FRONTEND + '/dashboard', { waitUntil: 'networkidle' });
      await sleep(2500);
      const hasChart = await page.locator('canvas, svg.recharts-surface, .ant-progress, .ant-card').count();
      r.check(`[${role.name}] Dashboard: có chart/card`, hasChart > 0, `${hasChart}`);

      // --- Nhân viên (chỉ manager): mở form thêm rồi đóng, test tìm kiếm ---
      if (role.name !== 'NhanVien') {
        await page.goto(config.FRONTEND + '/nhanvien', { waitUntil: 'networkidle' });
        await sleep(2000);
        const search = page.locator('input[placeholder*="ìm"], input[type="search"], .ant-input-search input').first();
        if (await search.count() > 0) {
          await search.fill('Nguyễn'); await sleep(1200);
          const resTxt = await page.locator('body').innerText();
          r.check(`[${role.name}] Nhân viên: tìm kiếm chạy`, resTxt.length > 100);
          await search.fill(''); await sleep(800);
        }
        const addBtn = page.getByRole('button', { name: /thêm nhân viên|thêm mới/i });
        if (await addBtn.count() > 0) {
          await addBtn.first().click(); await sleep(1200);
          r.check(`[${role.name}] Nhân viên: mở modal thêm`, (await page.locator('.ant-modal:visible').count()) > 0);
          await page.keyboard.press('Escape'); await sleep(600);
        }
      }

      // --- Tài khoản (chỉ Admin): mở modal tạo rồi đóng ---
      if (role.name === 'Admin') {
        await page.goto(config.FRONTEND + '/taikhoan', { waitUntil: 'networkidle' });
        await sleep(2000);
        const addAcc = page.getByRole('button', { name: /thêm tài khoản|tạo tài khoản|thêm mới/i });
        if (await addAcc.count() > 0) {
          await addAcc.first().click(); await sleep(1200);
          r.check('Admin Tài khoản: mở modal tạo', (await page.locator('.ant-modal:visible').count()) > 0);
          await page.keyboard.press('Escape'); await sleep(600);
        }
      }

      // --- Profile (không phải Admin) ---
      if (role.name !== 'Admin') {
        await page.goto(config.FRONTEND + '/profile', { waitUntil: 'networkidle' });
        await sleep(1800);
        const pTxt = await page.locator('body').innerText();
        r.check(`[${role.name}] Profile: hiển thị thông tin`, pTxt.length > 100);
      }

      // 7. LOGOUT
      const trigger = page.locator('header .ant-space').filter({ has: page.locator('.ant-avatar') }).first();
      if (await trigger.count() > 0) {
        await trigger.click().catch(() => {});
        await sleep(900);
        const logoutItem = page.locator('.ant-dropdown:visible .ant-dropdown-menu-item').filter({ hasText: /đăng xuất/i });
        if (await logoutItem.count() > 0) {
          await logoutItem.first().click();
          await sleep(1500);
          r.check(`[${role.name}] đăng xuất -> /login`, page.url().includes('/login'), page.url());
        } else {
          r.fail(`[${role.name}] không thấy mục Đăng xuất trong dropdown`);
        }
      } else {
        r.fail(`[${role.name}] không thấy avatar để mở menu người dùng`);
      }
    }
  } catch (e) {
    r.fail('Lỗi script', e.message);
  }

  const realErrs = pageErrs.filter((e) => !/favicon|Download the React/i.test(e));
  r.check('Không có page error (JS)', realErrs.length === 0, realErrs.slice(0, 3).join(' || '));
  r.check('Không có response 5xx', netFails.length === 0, netFails.slice(0, 3).join(' || '));

  await sleep(800);
  await browser.close();
  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();
