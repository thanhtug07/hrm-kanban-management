/**
 * run-all.js — Chạy toàn bộ bộ test tuần tự.
 * Chạy: node run-all.js
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const suites = [
  ['SMOKE', 'suites/smoke.test.js'],
  ['UI LAYOUT', 'suites/ui-layout.test.js'],
  ['API FUZZ', 'suites/api-fuzz.test.js'],
  ['RBAC', 'suites/rbac.test.js'],
  ['E2E', 'suites/e2e.test.js'],
];

console.log('╔══════════════════════════════════════════════════╗');
console.log('║   HRM PORTAL — CHẠY TOÀN BỘ BỘ TEST              ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\nĐiều kiện: backend (5100) + frontend (5173) đang chạy.\n');

const results = [];
for (const [name, file] of suites) {
  const full = path.join(__dirname, file);
  if (!fs.existsSync(full)) { console.log(`[SKIP] ${name} — không tìm thấy ${file}`); continue; }
  const res = spawnSync('node', [full], { stdio: 'inherit', shell: false });
  results.push({ name, code: res.status });
}

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   TỔNG KẾT                                       ║');
console.log('╚══════════════════════════════════════════════════╝');
let allOk = true;
for (const r of results) {
  const ok = r.code === 0;
  if (!ok) allOk = false;
  console.log(`  ${ok ? '✅ PASS' : '❌ FAIL'}  ${r.name}`);
}
console.log(`\n${allOk ? '✅ TẤT CẢ PASS' : '❌ CÓ SUITE THẤT BẠI'}`);
process.exit(allOk ? 0 : 1);
