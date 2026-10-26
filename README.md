# 🏢 HRM Portal — Hệ thống Quản lý Nhân sự & Kanban

> **Hệ thống quản trị nhân sự (HRM) kết hợp bảng công việc Kanban** — Bài tập lớn môn Cơ sở Dữ liệu.
> Xây dựng theo kiến trúc tách tầng (Clean Architecture) với **ASP.NET Core 8 Web API + SQL Server** ở backend và **React 19 + TypeScript** ở frontend.

<p align="center">
  <img alt=".NET" src="https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white">
  <img alt="SQL Server" src="https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white">
  <img alt="Ant Design" src="https://img.shields.io/badge/Ant%20Design-6-0170FE?logo=antdesign&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
</p>

---

## 📖 Giới thiệu

**HRM Portal** là một ứng dụng web full-stack quản lý nhân sự hoàn chỉnh, bao gồm:

- 👥 **Quản lý nhân viên** — CRUD, tìm kiếm, lọc phòng ban, phân trang
- 🕐 **Chấm công** — Check-in/Check-out, đồng hồ thời gian thực, lịch sử công cá nhân & toàn công ty
- 🌴 **Nghỉ phép** — Gửi đơn, duyệt/từ chối, tự động đồng bộ vào bảng chấm công (bỏ qua T7/CN)
- 💰 **Bảng lương** — Tính lương tự động qua Stored Procedure, quản lý thưởng/phạt/ứng lương
- 📋 **Kanban 4 cột** — Kéo thả task, phân công, bình luận, cảnh báo quá hạn
- 📊 **Dashboard** — KPI, biểu đồ, thống kê theo vai trò
- 🔐 **Phân quyền RBAC** — 3 vai trò: Admin / HR / Nhân viên

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Mô tả |
|---|---|
| ASP.NET Core 8 Web API | Framework chính, kiến trúc 3 lớp (Core / Infrastructure / API) |
| Entity Framework Core 8 | ORM, Database-First (map lên DB có sẵn) |
| SQL Server | Cơ sở dữ liệu quan hệ, Stored Procedures, Triggers, Views |
| JWT Bearer | Xác thực token |
| BCrypt.Net | Hash mật khẩu (WorkFactor 11) |
| FluentValidation | Validate đầu vào |
| Serilog | Ghi log có cấu trúc |
| Swagger / OpenAPI | Tài liệu & test API |

### Frontend
| Công nghệ | Mô tả |
|---|---|
| React 19 + TypeScript 6 | Framework UI, type-safe |
| Vite 8 | Build tool siêu nhanh |
| Ant Design 6 | Thư viện component |
| Zustand 5 | State management |
| Axios | HTTP client |
| `@hello-pangea/dnd` | Kéo thả Kanban |
| Recharts | Biểu đồ dashboard |

---

## 📂 Cấu trúc dự án

```text
hrm-kanban-management/
├── QUANLYNHANSU.sql        # ⭐ Script CSDL: 11 bảng, 6 views, 3 SP, 3 trigger (cấu trúc)
├── SEED_DATA.sql           # 🌱 Dữ liệu mẫu: 35 nhân viên, tài khoản, hợp đồng, chấm công...
├── backend/                # ASP.NET Core 8 Web API
│   ├── HRM.Core/           # Domain: Entities, DTOs, Interfaces, Constants
│   ├── HRM.Infrastructure/ # EF Core: AppDbContext, Configurations, PasswordHasher
│   └── HRM.API/            # Presentation: Controllers, Services, Validators
├── frontend/               # React 19 + TypeScript
│   └── src/
│       ├── api/            # Axios services
│       ├── components/     # UI components dùng chung
│       ├── layouts/        # HeaderBar, SiderMenu, MainLayout
│       ├── pages/          # Màn hình chức năng
│       ├── router/         # Định tuyến + RBAC guard
│       ├── stores/         # Zustand stores
│       ├── styles/         # Global CSS + design tokens
│       └── types/          # TypeScript types
├── tools/                  # DB Viewer (xem CSDL kiểu phpMyAdmin) + hướng dẫn
├── docs/                   # API contract, swagger.json, test report
├── run.bat / run.ps1       # ⭐ Chạy 1 lệnh: auto backend + frontend
├── README.md
└── TIEN_DO_CHI_TIET.md     # Nhật ký tiến độ chi tiết
```

---

## 🚀 Chạy nhanh (1 lệnh duy nhất)

Sau khi đã chuẩn bị môi trường (xem mục dưới), chỉ cần chạy:

```bat
run.bat
```

Script tự động: kiểm tra công cụ → tạo DB nếu thiếu → cài npm packages (nếu thiếu) →
build backend → mở **cả backend và frontend** trong 2 cửa sổ riêng → tự mở trình duyệt.

> Hoặc dùng PowerShell: `.\run.ps1`

| Dịch vụ | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5100 |
| Swagger | http://localhost:5100/swagger |

Tài khoản demo: **admin / Admin@123**

---

## 🛠️ Hướng dẫn cài đặt chi tiết (thủ công)

### Yêu cầu hệ thống
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- SQL Server (LocalDB, Express, hoặc Developer Edition)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) (khuyến nghị)

### Bước 1 — Tạo Cơ sở dữ liệu

**Yêu cầu:** SQL Server (bản đầy đủ/Express/Developer — KHÔNG dùng XAMPP/MySQL).
Kiểm tra server đang chạy: service `MSSQLSERVER` hoặc `MSSQL$SQLExpress`.

1. Mở **SSMS** hoặc **Azure Data Studio**, kết nối tới SQL Server của bạn (`localhost`, `.` hoặc `.\SQLEXPRESS`).
2. **File → Open File** chọn `QUANLYNHANSU.sql` → nhấn **F5** (Run All) để tạo cấu trúc 11 bảng + view + SP + trigger.
3. Tiếp tục **Open File** chọn `SEED_DATA.sql` → **F5** để nạp dữ liệu mẫu (35 nhân viên, tài khoản, hợp đồng...).

> Chạy 2 file **theo thứ tự**: `QUANLYNHANSU.sql` (cấu trúc) → `SEED_DATA.sql` (dữ liệu).
> Cả hai dùng `IF NOT EXISTS`/`MERGE` nên chạy lại nhiều lần không lỗi.
> **Lưu ý:** Script viết cho **SQL Server** (T-SQL), KHÔNG chạy được trên MySQL/XAMPP.

### Bước 2 — Chạy Backend

```bash
cd backend
dotnet restore
dotnet run --project HRM.API --launch-profile http
```

Backend khởi động tại **http://localhost:5100**
Swagger UI: **http://localhost:5100/swagger**

> ⚙️ **Cấu hình kết nối:** Sửa chuỗi kết nối trong `backend/HRM.API/appsettings.json` nếu SQL Server của bạn khác mặc định:
> ```json
> "ConnectionStrings": {
>   "DefaultConnection": "Server=localhost;Database=QUANLYNHANSU;Trusted_Connection=True;TrustServerCertificate=True"
> }
> ```
>
> 🔐 **JWT Secret:** Production cần đặt biến môi trường `JWT_SECRET_KEY` (tối thiểu 32 ký tự). Môi trường Development đã có sẵn secret trong `appsettings.Development.json`.

### Bước 3 — Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend khởi động tại **http://localhost:5173**

> Biến môi trường API nằm ở `frontend/.env.development`: `VITE_API_URL=http://localhost:5100`

---

## 🔑 Tài khoản Demo

| Tài khoản | Mật khẩu | Vai trò | Nhân viên | Quyền hạn |
| :--- | :--- | :---: | :--- | :--- |
| `admin` | `Admin@123` | **Admin** | NV000 | Toàn quyền hệ thống, quản trị tài khoản |
| `hr01` | `Hr@123` | **HR** | NV002 | Quản lý nhân sự, chấm công, tính lương, giao task |
| `hr02` | `Hr@123` | **HR** | NV010 | Nghiệp vụ nhân sự & Kanban |
| `nv001` | `Nv@123` | **Nhân viên** | NV006 | Xem hồ sơ, nghỉ phép, kéo task của mình |
| `nv002` | `Nv@123` | **Nhân viên** | NV007 | Xem hồ sơ, phiếu lương, kéo task của mình |

---

## 🔐 Phân quyền (RBAC)

| Chức năng | Admin | HR | Nhân viên |
|---|:---:|:---:|:---:|
| Dashboard tổng quan | ✅ | ✅ | ❌ (chỉ xem cá nhân) |
| Quản lý nhân viên | ✅ | ✅ | ❌ |
| Quản lý tài khoản | ✅ | ✅ | ❌ (chỉ trang cá nhân) |
| Kanban — tạo/giao task | ✅ | ✅ | ❌ |
| Kanban — kéo task của mình | ✅ | ✅ | ✅ |
| Chấm công | ✅ | ✅ | ✅ (của mình) |
| Nghỉ phép — duyệt đơn | ✅ | ✅ | ❌ |
| Bảng lương — tính lương | ✅ | ❌ | ❌ |
| Bảng lương — xem | ✅ | ✅ | ✅ (của mình) |

---

## ✨ Điểm nổi bật kỹ thuật

- **Stored Procedure tự sinh mã nhân viên** với `UPDLOCK, HOLDLOCK` — chống trùng mã khi chèn đồng thời.
- **Trigger đồng bộ nghỉ phép → chấm công** — tự động bỏ qua Thứ Bảy & Chủ Nhật.
- **Tính lương Idempotent** — chạy lại nhiều lần không bị trùng dữ liệu.
- **Kanban Gap-based ordering** (gap 1000 + rebalance) — kéo thả mượt không lo trùng vị trí.
- **Cột ThựcLĩnh PERSISTED** — SQL Server tự động tính toán.
- **Sidebar premium SaaS** — gradient, animation, menu động theo vai trò.
- **Bảo mật** — JWT qua biến môi trường, BCrypt hash, chống leo thang đặc quyền.

---

## 🗄️ Cơ sở dữ liệu

**11 bảng:** `PhongBan`, `ChucVu`, `NhanVien`, `HopDong`, `ChamCong`, `NghiPhep`, `BangLuong`, `ChiPhiPhatSinh`, `CongViec`, `TaiKhoan`, `BinhLuan`

**6 Views:** `VW_DanhSachNhanVien`, `VW_ChamCongThang`, `VW_BangLuongChiTiet`, `VW_BoardKanban`, `VW_TaskQuaHan`, `VW_NangSuatNhanVien`

**3 Stored Procedures:** `SP_ThemNhanVien`, `SP_DiChuyenTask`, `SP_TinhLuongThang`

**3 Triggers:** `TR_CongViec_Update`, `TR_NghiPhep_Update`, `TR_HopDong_Update`

---

## 📚 Tài liệu bổ sung

- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — Hợp đồng API cho frontend
- [`docs/swagger.json`](docs/swagger.json) — Đặc tả OpenAPI v3
- [`docs/SWAGGER_TEST_REPORT.md`](docs/SWAGGER_TEST_REPORT.md) — Báo cáo kiểm thử
- [`TIEN_DO_CHI_TIET.md`](TIEN_DO_CHI_TIET.md) — Nhật ký tiến độ chi tiết

---

## 👤 Tác giả

**thanhtug07**

- GitHub: [@thanhtug07](https://github.com/thanhtug07)

---

## 📄 Giấy phép

Dự án phát hành theo giấy phép [MIT](https://opensource.org/licenses/MIT).