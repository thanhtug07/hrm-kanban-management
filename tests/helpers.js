/**
 * helpers.js — Hàm tiện ích dùng chung cho các test suite.
 */
const { chromium } = require('playwright-core');
const config = require('./config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Quản lý kết quả test
class Runner {
  constructor(name) {
    this.name = name;
    this.results = [];
  }
  pass(name, detail = '') {
    this.results.push({ name, ok: true, detail });
    console.log(`  PASS | ${name}${detail ? ' | ' + detail : ''}`);
  }
  fail(name, detail = '') {
    this.results.push({ name, ok: false, detail });
    console.log(`  FAIL | ${name}${detail ? ' | ' + detail : ''}`);
  }
  check(name, ok, detail = '') {
    ok ? this.pass(name, detail) : this.fail(name, detail);
  }
  summary() {
    const passed = this.results.filter((r) => r.ok).length;
    const total = this.results.length;
    console.log(`\n  ===== ${this.name}: ${passed}/${total} PASS =====`);
    return { passed, total, ok: passed === total };
  }
}

// Khởi tạo browser + page
async function launchBrowser() {
  if (!config.CHROME) {
    throw new Error('Không tìm thấy Chromium. Cài Playwright: npx playwright install chromium\nHoặc set CHROME_PATH.');
  }
  const browser = await chromium.launch({ executablePath: config.CHROME, headless: config.HEADLESS });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  return { browser, ctx, page };
}

// Đăng nhập qua UI
async function login(page, user, pass) {
  // Bắt đầu từ trang trắng để xóa lịch sử SPA của phiên trước (tránh bị điều hướng
  // về trang cũ như /taikhoan -> /403 khi đổi vai trò trên cùng một trình duyệt).
  await page.goto('about:blank');
  await page.goto(config.FRONTEND + '/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  const inputs = page.locator('input');
  await inputs.nth(0).fill(user);
  await inputs.nth(1).fill(pass);
  await page.getByRole('button', { name: /đăng nhập/i }).first().click();
  await page.waitForURL(/\/(dashboard)/, { timeout: 15000 }).catch(() => {});
  await sleep(2200);
}

// Đăng nhập qua API, trả token
async function apiLogin(request, user, pass) {
  const res = await request.post(config.API + '/api/auth/login', {
    data: { tenDangNhap: user, matKhau: pass },
  });
  const json = await res.json();
  return json?.data?.token || null;
}

// Kiểm tra server đang chạy
async function checkServers(request) {
  const out = { frontend: false, api: false };
  try { out.frontend = (await request.get(config.FRONTEND + '/')).status() === 200; } catch {}
  try { out.api = (await request.get(config.API + '/api/health')).status() < 500; } catch {
    try { await request.post(config.API + '/api/auth/login', { data: { tenDangNhap: 'x', matKhau: 'x' } }); out.api = true; } catch {}
  }
  return out;
}


// ==== Con trỏ ảo: vẽ chấm đỏ + highlight phần tử, di chuyển theo chuột ====
async function installCursor(page) {
  await page.addStyleTag({
    content: `
      #__vcursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; margin: -11px 0 0 -11px;
        border-radius: 50%; background: rgba(239,68,68,0.85); border: 2px solid #fff;
        box-shadow: 0 0 0 3px rgba(239,68,68,0.35); pointer-events: none; transition: left .12s ease, top .12s ease; }
      #__vcursor::after { content: ''; position: absolute; left: 18px; top: 16px; width: 0; height: 0;
        border-left: 8px solid rgba(239,68,68,0.85); border-bottom: 8px solid transparent; }
      #__vlabel { position: fixed; z-index: 2147483647; padding: 2px 7px; border-radius: 5px;
        background: #111827; color: #fff; font: 600 11px/1.4 system-ui, sans-serif; pointer-events: none;
        transform: translate(14px, 14px); white-space: nowrap; }
      .__vhighlight { outline: 3px solid #f59e0b !important; outline-offset: 2px !important;
        transition: outline .1s ease; }
    `,
  });
  await page.evaluate(() => {
    if (document.getElementById('__vcursor')) return;
    const c = document.createElement('div'); c.id = '__vcursor'; document.body.appendChild(c);
    const l = document.createElement('div'); l.id = '__vlabel'; document.body.appendChild(l);
    document.addEventListener('mousemove', (e) => {
      c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
    }, true);
  });
}

// Di chuyển chuột ảo tới element, highlight, rồi (tùy chọn) click
async function moveTo(page, locator, label = '', doClick = false) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
    const box = await locator.boundingBox();
    if (!box) return false;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // move chuột thật (kích hoạt mousemove -> con trỏ ảo chạy theo)
    await page.mouse.move(x, y, { steps: 8 });
    // highlight element
    await locator.evaluate((el) => { el.classList.add('__vhighlight'); }).catch(() => {});
    // cập nhật nhãn + con trỏ (đề phòng mousemove không tới)
    await page.evaluate(({ x, y, label }) => {
      const c = document.getElementById('__vcursor'); const l = document.getElementById('__vlabel');
      if (c) { c.style.left = x + 'px'; c.style.top = y + 'px'; }
      if (l) { l.style.left = x + 'px'; l.style.top = y + 'px'; l.textContent = label; }
    }, { x, y, label }).catch(() => {});
    await sleep(350); // dừng để mắt kịp thấy
    if (doClick) { await page.mouse.click(x, y); }
    await locator.evaluate((el) => { el.classList.remove('__vhighlight'); }).catch(() => {});
    return true;
  } catch { return false; }
}

module.exports = { sleep, Runner, launchBrowser, login, apiLogin, checkServers, installCursor, moveTo, config };
