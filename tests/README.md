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

**Bắt buộc:** backend (`:5100`) + frontend (`:5173`) đang chạy, và DB SQL Server đã được seed.
Cách nhanh để có đủ 3 điều kiện:

```powershell
.\run.ps1            # kiểm tra công cụ + tạo DB nếu thiếu + build + chạy cả backend & frontend
# hoặc: run.bat (build + chạy server trong một lần)
```

Nếu chưa có DB, nạp thủ công `QUANLYNHANSU.sql` → `SEED_DATA.sql` (xem README gốc dự án).
Bộ test dùng các tài khoản demo nên DB **phải** đã seed dữ liệu mẫu.

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

```cmd
:: cmd.exe
set HEADLESS=1 && npm test
```

```powershell
# PowerShell 5.1+ (cú pháp 'set ... &&' của cmd KHÔNG dùng được ở đây)
$env:HEADLESS=1; npm test
```

---

## 📊 Kết quả

Mỗi suite in ra `PASS`/`FAIL` từng test và tổng kết `x/y PASS`. Exit code `0` = tất cả pass, `1` = có test fail (dùng được cho CI).

## ⚠️ Lưu ý

- **E2E test tạo rồi xóa dữ liệu tạm** trên DB demo (task `AUTO-TEST-*`). Chạy trên DB test/demo, tránh DB production.
- **RBAC test** có tạo 1 tài khoản Admin tên `ok_<timestamp>` — nên dọn định kỳ nếu chạy nhiều lần.
- Các suite dùng tài khoản demo: `admin/Admin@123`, `hr01/Hr@123`, `nv001/Nv@123`.

---

## 🧩 Bộ test Backend (xUnit) — `backend/HRM.Tests`

Ngoài bộ Playwright ở trên, backend có bộ test xUnit riêng (không cần chạy backend/frontend):

| File | Nội dung |
|---|---|
| `ChamCongServiceTests.cs` | Logic check-in/check-out, khung giờ, tính trạng thái |
| `NghiPhepServiceTests.cs` | Nghiệp vụ nghỉ phép, chống trùng lịch |
| `ValidatorTests.cs` | FluentValidation cho DTO chính |
| `ValidatorCoverageTests.cs` | Bao phủ thêm các nhánh validator |
| `PayrollSqlIntegrationTests.cs` | **Integration test cần SQL Server thật** (xem dưới) |

Chạy toàn bộ (integration test tự skip):

```powershell
cd backend
dotnet test
```

### Integration test cần SQL Server — `PayrollSqlIntegrationTests`

Các test này kiểm chứng hành vi mà EF Core InMemory **không thể** kiểm tra: stored procedure
`SP_TinhLuongThang`, trigger `TR_NghiPhep_Update`, ràng buộc `UNIQUE(MaNV, Ngay)`. Mặc định chúng
**bị skip** và chỉ chạy khi đặt `HRM_SQL_TEST=1`:

```powershell
$env:HRM_SQL_TEST=1                                                  # bắt buộc để bật
$env:HRM_SQL_CONNSTR="Server=(localdb)\MSSQLLocalDB;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"  # tùy chọn
dotnet test --filter "FullyQualifiedName~PayrollSqlIntegrationTests"
```

- Cần một SQL Server truy cập được và file `QUANLYNHANSU.sql` ở gốc repo.
- Mỗi test tạo một database tạm `HRM_Test_<guid>`, nạp schema rồi **DROP** sau khi xong — không đụng DB `QUANLYNHANSU`.
- Nếu không đặt `HRM_SQL_TEST=1`, các test báo `Skipped` (không phải pass giả).
