/**
 * smoke.test.js — Kiểm tra nhanh: app chạy, login được, các trang render không lỗi.
 * Chạy: node suites/smoke.test.js
 */
const { request } = require('playwright-core');
const { Runner, launchBrowser, login, sleep, checkServers, config } = require('../helpers');

(async () => {
  const r = new Runner('SMOKE');
  console.log('\n=== SMOKE TEST ===\n');

  // 1. Server
  const apiReq = await request.newContext();
  const servers = await checkServers(apiReq);
  r.check('Backend API đang chạy', servers.api, config.API);
  r.check('Frontend đang chạy', servers.frontend, config.FRONTEND);
  if (!servers.frontend || !servers.api) {
    console.log('\n  [DỪNG] Cần chạy backend + frontend trước khi test (dùng run.bat).');
    await apiReq.dispose();
    r.summary();
    process.exit(1);
  }
  await apiReq.dispose();

  // 2. Login + render các trang
  const { browser, page } = await launchBrowser();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));

  try {
    await login(page, config.ACCOUNTS.admin.u, config.ACCOUNTS.admin.p);
    r.check('Đăng nhập admin', page.url().includes('/dashboard'), page.url());

    const pages = [
      ['Dashboard', '/dashboard'], ['Nhân viên', '/nhanvien'], ['Chấm công', '/chamcong'],
      ['Nghỉ phép', '/nghiphep'], ['Kanban', '/kanban'], ['Bảng lương', '/bangluong'],
      ['Tài khoản', '/taikhoan'], ['Profile', '/profile'],
    ];
    for (const [name, url] of pages) {
      await page.goto(config.FRONTEND + url, { waitUntil: 'networkidle' });
      await sleep(1500);
      const txt = await page.locator('body').innerText();
      r.check(`Trang ${name} render OK`, txt.length > 100 && !/Cannot read|Something went wrong/i.test(txt));
    }
  } catch (e) {
    r.fail('Lỗi script', e.message);
  }

  const realErrs = errs.filter((e) => !/favicon|Download the React/i.test(e));
  r.check('Không có page error', realErrs.length === 0, realErrs.slice(0, 2).join(' || '));

  await sleep(800);
  await browser.close();
  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();
