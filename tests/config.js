/**
 * config.js — Cấu hình chung cho bộ test.
 * Có thể override qua biến môi trường.
 */
const os = require('os');
const path = require('path');

// Đường dẫn Chromium: ưu tiên env, rồi đường dẫn ms-playwright mặc định (Windows)
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const home = os.homedir();
  const candidates = [
    path.join(home, 'AppData', 'Local', 'ms-playwright', 'chromium-1248', 'chrome-win64', 'chrome.exe'),
    path.join(home, 'AppData', 'Local', 'ms-playwright', 'chromium-1148', 'chrome-win64', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const fs = require('fs');
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

module.exports = {
  CHROME: findChrome(),
  FRONTEND: process.env.FRONTEND_URL || 'http://localhost:5173',
  API: process.env.API_URL || 'http://localhost:5100',
  HEADLESS: process.env.HEADLESS === '1',
  // tài khoản demo
  ACCOUNTS: {
    admin: { u: 'admin', p: 'Admin@123', role: 'Admin' },
    hr: { u: 'hr01', p: 'Hr@123', role: 'HR' },
    nv: { u: 'nv001', p: 'Nv@123', role: 'NhanVien' },
  },
};
