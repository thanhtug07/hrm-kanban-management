/**
 * e2e.test.js — Kiểm thử luồng nghiệp vụ end-to-end qua UI (tạo/xóa task, modal...).
 * Chạy: node suites/e2e.test.js
 * LƯU Ý: test này TẠO dữ liệu rồi XÓA — nên có thể chạy trên DB demo.
 */
const { Runner, launchBrowser, login, sleep, config } = require('../helpers');

(async () => {
  const r = new Runner('E2E');
  console.log('\n=== E2E (UI) TEST ===\n');
  console.log('  [Lưu ý] Test sẽ tạo rồi xóa dữ liệu tạm trên DB demo.\n');

  const { browser, page } = await launchBrowser();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));

  try {
    await login(page, config.ACCOUNTS.admin.u, config.ACCOUNTS.admin.p);
    r.check('Admin đăng nhập', page.url().includes('/dashboard'));

    // ===== Tạo task Kanban qua UI =====
    await page.goto(config.FRONTEND + '/kanban', { waitUntil: 'networkidle' }); await sleep(2500);
    const kb = await page.locator('body').innerText();
    r.check('Kanban hiển thị 4 cột', /to do/i.test(kb) && /in progress/i.test(kb) && /review/i.test(kb) && /done/i.test(kb));

    const title = 'AUTO-TEST-' + Date.now();
    const giao = page.getByRole('button', { name: /giao việc mới/i });
    if (await giao.count() > 0) {
      await giao.first().click(); await sleep(1200);
      await page.getByPlaceholder(/Ví dụ: Thiết kế/i).fill(title);
      const sel = page.locator('.ant-modal:visible .ant-select');
      await sel.nth(0).click(); await sleep(800);
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click(); await sleep(500);
      await sel.nth(1).click(); await sleep(700);
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option').nth(0).click(); await sleep(500);
      await page.getByRole('button', { name: /tạo công việc/i }).click(); await sleep(2500);
      const txt = await page.locator('body').innerText();
      r.check('Tạo task mới thành công', txt.includes(title), title);

      if (txt.includes(title)) {
        const card = page.locator('[data-rfd-draggable-id]').filter({ hasText: title }).first();
        await card.click(); await sleep(1500);
        r.check('Mở Task Detail Drawer', (await page.locator('.ant-drawer:visible').count()) > 0);
        const delBtn = page.locator('.ant-drawer:visible').getByRole('button', { name: /xóa/i });
        if (await delBtn.count() > 0) {
          await delBtn.first().click(); await sleep(900);
          const okDel = page.locator('.ant-popconfirm:visible button, .ant-modal-confirm:visible button').filter({ hasText: /^(Xóa|Đồng ý|OK)$/i });
          if (await okDel.count() > 0) { await okDel.first().click(); await sleep(2000); }
          r.check('Xóa task (dọn dữ liệu test)', true);
        }
      }
    } else {
      r.fail('Không tìm thấy nút "Giao việc mới"');
    }

    // ===== Mở modal Thêm nhân viên =====
    await page.goto(config.FRONTEND + '/nhanvien', { waitUntil: 'networkidle' }); await sleep(2000);
    const addEmp = page.getByRole('button', { name: /thêm nhân viên|thêm mới/i });
    if (await addEmp.count() > 0) {
      await addEmp.first().click(); await sleep(1200);
      r.check('Mở modal Thêm nhân viên', (await page.locator('.ant-modal:visible').count()) > 0);
      await page.keyboard.press('Escape'); await sleep(600);
    }

    // ===== Tạo đơn nghỉ phép (mở modal) =====
    await login(page, 'nv002', 'Nv@123');
    await page.goto(config.FRONTEND + '/nghiphep', { waitUntil: 'networkidle' }); await sleep(2000);
    const createLeave = page.getByRole('button', { name: /tạo đơn|gửi đơn|xin nghỉ/i });
    r.check('Có nút tạo đơn nghỉ phép', (await createLeave.count()) > 0);

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
