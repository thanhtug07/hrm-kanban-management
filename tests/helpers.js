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
  await page.goto(config.FRONTEND + '/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(config.FRONTEND + '/login', { waitUntil: 'networkidle' });
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

module.exports = { sleep, Runner, launchBrowser, login, apiLogin, checkServers, config };
