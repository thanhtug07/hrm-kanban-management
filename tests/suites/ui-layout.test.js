/**
 * ui-layout.test.js — Kiểm tra bố cục/UI: đo khoảng trống, card, responsive.
 * Chạy: node suites/ui-layout.test.js
 */
const { Runner, launchBrowser, login, sleep, config } = require('../helpers');

const PAGES = [
  ['dashboard', '/dashboard'], ['nhanvien', '/nhanvien'], ['chamcong', '/chamcong'],
  ['nghiphep', '/nghiphep'], ['kanban', '/kanban'], ['bangluong', '/bangluong'],
  ['taikhoan', '/taikhoan'], ['profile', '/profile'],
];

(async () => {
  const r = new Runner('UI LAYOUT');
  console.log('\n=== UI LAYOUT TEST ===\n');

  const { browser, page } = await launchBrowser();
  try {
    await login(page, config.ACCOUNTS.admin.u, config.ACCOUNTS.admin.p);

    for (const [name, url] of PAGES) {
      await page.goto(config.FRONTEND + url, { waitUntil: 'networkidle' });
      await sleep(2000);
      const m = await page.evaluate(() => {
        const content = document.querySelector('.ant-layout-content');
        const sider = document.querySelector('.hrm-sider');
        const footer = document.querySelector('.ant-layout-footer');
        return {
          contentW: content ? Math.round(content.getBoundingClientRect().width) : 0,
          siderW: sider ? Math.round(sider.getBoundingClientRect().width) : 0,
          hasFooter: !!footer,
          bodyW: document.body.scrollWidth,
          overflowX: document.body.scrollWidth > window.innerWidth + 2,
        };
      });
      r.check(`${name}: nội dung hiển thị`, m.contentW > 300, `contentW=${m.contentW}`);
      r.check(`${name}: không tràn ngang`, !m.overflowX, `bodyW=${m.bodyW}`);
    }

    // Dashboard: 2 cột không lệch quá nhiều (đo grid cân bằng)
    await page.goto(config.FRONTEND + '/dashboard', { waitUntil: 'networkidle' }); await sleep(2500);
    const bal = await page.evaluate(() => {
      const grid = document.querySelector('.dash-balanced-row');
      if (!grid) return null;
      const kids = [...grid.children].map((k) => Math.round(k.getBoundingClientRect().height));
      return { kids };
    });
    if (bal && bal.kids.length === 2) {
      const diff = Math.abs(bal.kids[0] - bal.kids[1]);
      r.check('Dashboard 2 cột không lệch lớn (<300px)', diff < 300, `lệch ${diff}px (${bal.kids.join(' vs ')})`);
    } else {
      r.check('Dashboard có hàng cân bằng', !!bal);
    }

    // Responsive: mobile 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(config.FRONTEND + '/dashboard', { waitUntil: 'networkidle' }); await sleep(2000);
    const mob = await page.evaluate(() => ({ overflowX: document.body.scrollWidth > window.innerWidth + 2 }));
    r.check('Mobile 390px không tràn ngang', !mob.overflowX);

  } catch (e) {
    r.fail('Lỗi script', e.message);
  }
  await browser.close();
  const s = r.summary();
  process.exit(s.ok ? 0 : 1);
})();
