# 🧪 HRM Portal — Bộ kiểm thử tự động

Bộ test tự động cho dự án: **Smoke** (app chạy), **UI Layout** (bố cục), **API Fuzz** (validate), **RBAC** (phân quyền), **E2E** (luồng nghiệp vụ).

Công nghệ: **Playwright** (điều khiển Chrome thật) + gọi API trực tiếp bằng `playwright-core request`.

---

## ⚙️ Cài đặt (1 lần)

```bash
cd tests
npm install
```

Nếu chưa có Chromium, tải:

```bash
npx playwright install chromium
```

> Nếu dùng Chromium đã cài sẵn ở máy, bộ test tự tìm. Hoặc trỏ tay: `set CHROME_PATH=C:\path\to\chrome.exe`

## 🚀 Cách chạy

**Bắt buộc:** backend (`:5100`) + frontend (`:5173`) đang chạy. Cách nhanh: chạy `run.bat` ở thư mục gốc dự án.

```bash
# Chạy TẤT CẢ bộ test
npm test

# Hoặc chạy từng bộ
npm run test:smoke      # App chạy + login + render các trang
npm run test:ui         # Bố cục, khoảng trống, responsive
npm run test:api        # Validate đầu vào (fuzz), phân trang
npm run test:rbac       # Phân quyền theo vai trò + IDOR
npm run test:e2e        # Tạo/xóa task qua UI, mở modal
```

Hoặc gọi trực tiếp: `node suites/smoke.test.js`

---

## 📂 Cấu trúc

```
tests/
├── config.js                 # Cấu hình: URL, tài khoản demo, đường dẫn Chrome
├── helpers.js                # Hàm dùng chung: Runner, login, launchBrowser
├── run-all.js                # Chạy toàn bộ suite
├── package.json
├── README.md
└── suites/
    ├── smoke.test.js         # Khởi động + render
    ├── ui-layout.test.js     # Bố cục/khoảng trống/responsive
    ├── api-fuzz.test.js      # Validate input + phân trang
    ├── rbac.test.js          # Phân quyền + leo thang đặc quyền
    └── e2e.test.js           # Luồng tạo/xóa task, modal
```

---

## 🔧 Tuỳ chỉnh

Đặt biến môi trường trước khi chạy:

| Biến | Mặc định | Mô tả |
|---|---|---|
| `FRONTEND_URL` | `http://localhost:5173` | URL frontend |
| `API_URL` | `http://localhost:5100` | URL backend API |
| `CHROME_PATH` | tự tìm | Đường dẫn chrome.exe |
| `HEADLESS` | `0` | `1` = chạy ẩn (không hiện cửa sổ) |

Ví dụ chạy ẩn (CI):

```bash
set HEADLESS=1 && npm test
```

---

## 📊 Kết quả

Mỗi suite in ra `PASS`/`FAIL` từng test và tổng kết `x/y PASS`. Exit code `0` = tất cả pass, `1` = có test fail (dùng được cho CI).

## ⚠️ Lưu ý

- **E2E test tạo rồi xóa dữ liệu tạm** trên DB demo (task `AUTO-TEST-*`). Chạy trên DB test/demo, tránh DB production.
- **RBAC test** có tạo 1 tài khoản Admin tên `ok_<timestamp>` — nên dọn định kỳ nếu chạy nhiều lần.
- Các suite dùng tài khoản demo: `admin/Admin@123`, `hr01/Hr@123`, `nv001/Nv@123`.
