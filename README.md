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
├── SEED_DATA.sql           # 🌱 Dữ liệu mẫu: 100 nhân viên, 100 task, 100 hợp đồng, 100 đơn phép...
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
├── run.bat                 # Build backend + frontend (KHÔNG khởi động server)
├── start.bat               # Khởi động backend + frontend đã build
├── run.ps1                 # ⭐ All-in-one (PowerShell): kiểm tra → tạo DB → build → chạy
├── README.md
└── TIEN_DO_CHI_TIET.md     # Nhật ký tiến độ chi tiết
```

---

## 🚀 Chạy nhanh

Sau khi đã chuẩn bị môi trường (xem mục dưới), có 2 cách:

**Cách 1 — All-in-one bằng PowerShell (khuyến nghị):**

```powershell
.\run.ps1
```

`run.ps1` là script duy nhất làm đủ mọi bước: kiểm tra công cụ (dotnet, node) → kiểm tra/tạo DB
`QUANLYNHANSU` bằng `sqlcmd` (chỉ khi có `sqlcmd`, mặc định LocalDB) → cài npm packages nếu thiếu →
build backend → mở backend và frontend trong 2 cửa sổ riêng → đợi backend và frontend phản hồi rồi tự mở trình duyệt.

**Cách 2 — Chạy thủ công bằng 2 file .bat:**

```bat
run.bat     :: BUILD only — không khởi động server, không tạo DB
start.bat   :: Khởi động backend + frontend đã build, rồi mở trình duyệt
```

- `run.bat` chỉ **build**: dọn tiến trình cũ → kiểm tra công cụ → build backend (`dotnet build`) →
  cài npm packages nếu thiếu → build frontend (`npm run build`). Script kết thúc bằng dòng nhắc
  "Để CHẠY server: nhấp đúp `start.bat`" — nó **không** tạo database và **không** mở server.
- `start.bat` **khởi động** backend + frontend trong 2 cửa sổ riêng. Nó yêu cầu backend đã build
  và `frontend\node_modules` đã tồn tại (báo chạy `run.bat` trước nếu thiếu), sau đó đợi backend
  (`/api/healthcheck/database`) và frontend phản hồi rồi mới tự mở trình duyệt tại http://localhost:5173.

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

**Yêu cầu:** SQL Server (LocalDB, Express hoặc Developer Edition — KHÔNG dùng XAMPP/MySQL).
Lưu ý hai mặc định khác nhau trong dự án:
- **Backend** (`backend/HRM.API/appsettings.json`) mặc định `Server=localhost`.
- **Các script/công cụ** (`run.ps1`, `tools/db_viewer.py`, `tools/HEALTH_CHECK.ps1`) mặc định `(localdb)\MSSQLLocalDB`.

Chọn một instance, tạo DB trên đó, rồi đảm bảo chuỗi kết nối backend trỏ đúng cùng instance (xem Bước 2).

1. Mở **SSMS** hoặc **Azure Data Studio**, kết nối tới SQL Server của bạn (`localhost` hoặc `(localdb)\MSSQLLocalDB`).
2. **File → Open File** chọn `QUANLYNHANSU.sql` → nhấn **F5** (Run All) để tạo cấu trúc 11 bảng + view + SP + trigger.
3. Tiếp tục **Open File** chọn `SEED_DATA.sql` → **F5** để nạp dữ liệu mẫu (100 nhân viên, 100 task Kanban, 100 hợp đồng...).

> Chạy 2 file **theo thứ tự**: `QUANLYNHANSU.sql` (cấu trúc) → `SEED_DATA.sql` (dữ liệu).
> **Lưu ý quan trọng:** `SEED_DATA.sql` **XÓA toàn bộ dữ liệu hiện có** trong các bảng nghiệp vụ
> (BinhLuan, CongViec, ChiPhiPhatSinh, BangLuong, NghiPhep, ChamCong, HopDong, TaiKhoan, NhanVien,
> PhongBan, ChucVu) rồi nạp lại từ đầu. Hãy **backup** trước nếu đang có dữ liệu thật.
> Chạy lại file này nhiều lần vẫn cho kết quả giống nhau (idempotent).
> **Lưu ý:** Script viết cho **SQL Server** (T-SQL), KHÔNG chạy được trên MySQL/XAMPP.
> Script `QUANLYNHANSU.sql` tạo DB với collation **`Vietnamese_CI_AS`** (cần thiết để so khớp/sắp xếp tiếng Việt đúng).

> ⚠️ **Hai instance SQL Server khác nhau sẽ tạo ra hai CSDL khác nhau.** Backend đọc theo
> `Server=` trong `appsettings.json` (mặc định `localhost`), còn một số công cụ trong dự án
> (`run.ps1`, `tools/db_viewer.py`, `tools/HEALTH_CHECK.ps1`) mặc định `(localdb)\MSSQLLocalDB`.
> Nếu bạn seed vào LocalDB nhưng backend trỏ `localhost`, ứng dụng sẽ **không thấy dữ liệu mới**.
> Luôn đảm bảo seed và backend dùng **cùng một instance**.

### Bước 2 — Chạy Backend

```bash
cd backend
dotnet restore
dotnet run --project HRM.API --launch-profile http
```

Backend khởi động tại **http://localhost:5100**
Swagger UI: **http://localhost:5100/swagger**

> ⚙️ **Cấu hình kết nối:** Chuỗi kết nối nằm trong `backend/HRM.API/appsettings.json`. Mặc định trong repo là:
> ```json
> "ConnectionStrings": {
>   "DefaultConnection": "Server=localhost;Database=QUANLYNHANSU;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
> }
> ```
> Nếu dùng SQL Server standalone, sửa `Server=...` cho khớp instance của bạn (ví dụ `Server=.\SQLEXPRESS`).
> Nếu dùng LocalDB (mặc định của các script trong dự án), đổi thành `Server=(localdb)\MSSQLLocalDB`.
>
> 🔐 **JWT Secret (BẮT BUỘC):** Backend **từ chối khởi động** nếu secret rỗng hoặc ngắn hơn **32 ký tự**.
> `appsettings.json` để trống `"SecretKey": ""` và `appsettings.Development.json` KHÔNG chứa secret, nên bạn phải tự cung cấp.
> Đặt qua biến môi trường `JWT_SECRET_KEY` (được ưu tiên) hoặc `JwtSettings:SecretKey` trong config.
>
> PowerShell — chỉ cho phiên hiện tại:
> ```powershell
> $env:JWT_SECRET_KEY="mot-chuoi-bi-mat-toi-thieu-32-ky-tu-abc123"
> ```
> PowerShell — đặt cố định cho user (mở terminal mới mới có hiệu lực):
> ```powershell
> [Environment]::SetEnvironmentVariable("JWT_SECRET_KEY", "mot-chuoi-bi-mat-toi-thieu-32-ky-tu-abc123", "User")
> ```

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

Mật khẩu dùng chung theo nhóm vai trò:

| Nhóm | Mật khẩu | Vai trò | Ghi chú |
| :--- | :--- | :---: | :--- |
| `admin` | `Admin@123` | **Admin** | Nhân viên NV000 — toàn quyền hệ thống |
| `hr01` … `hr09` | `Hr@123` | **HR** | Quản lý nhân sự, chấm công, duyệt nghỉ phép, giao task (không có Bảng lương) |
| `tp01` … `tp10` | `Hr@123` | **HR** (Trưởng phòng) | Quản lý phòng ban mình phụ trách qua `MaNV_QL` |
| `nv001` … `nv030` | `Nv@123` | **Nhân viên** | Xem hồ sơ, nghỉ phép, kéo task của mình |

Tài khoản hay dùng để demo nhanh:

| Tài khoản | Mật khẩu | Vai trò | Nhân viên |
| :--- | :--- | :---: | :--- |
| `admin` | `Admin@123` | **Admin** | NV000 |
| `hr01` | `Hr@123` | **HR** | NV002 |
| `hr02` | `Hr@123` | **HR** | NV014 |
| `nv001` | `Nv@123` | **Nhân viên** | NV006 |
| `nv002` | `Nv@123` | **Nhân viên** | NV007 |
| `tp01` | `Hr@123` | **HR** (Trưởng phòng PB001) | NV001 |

> 💡 Tổng cộng **50 tài khoản** (1 admin + 9 HR + 10 trưởng phòng + 30 nhân viên), tất cả đều
> map tới nhân viên có thật trong bảng `NhanVien`.

> ⚠️ **Lưu ý về vai trò `TruongPhong`:** hằng số `RoleConstants.TruongPhong` có trong code C#,
> nhưng CHECK constraint `CK_TaiKhoan_VaiTro` trong CSDL chỉ cho phép `Admin` / `HR` / `NhanVien`.
> Vì vậy các tài khoản trưởng phòng (`tp01`…) được cấp vai trò **HR**; quyền quản lý phòng ban
> vẫn được xác định qua `PhongBan.MaNV_QL`. Muốn dùng đúng vai trò `TruongPhong` thì phải sửa
> constraint trong `QUANLYNHANSU.sql` trước.

---

## 🌱 Dữ liệu mẫu (SEED_DATA.sql)

Chạy `SEED_DATA.sql` sẽ nạp (sau khi xóa dữ liệu cũ):

| Bảng | Số dòng | Đặc điểm dữ liệu |
| :--- | ---: | :--- |
| `PhongBan` | 10 | PB001–PB010, mỗi phòng có `MaNV_QL` là một trưởng phòng thật |
| `ChucVu` | 8 | Từ Giám đốc điều hành (40tr) đến Thực tập sinh (4tr) |
| `NhanVien` | **100** | NV000–NV099; 51 Nam / 49 Nữ; 10 người mỗi phòng; 8 chức danh; 90 đang làm / 6 tạm nghỉ / 4 nghỉ việc |
| `TaiKhoan` | 50 | 1 Admin + 9 HR + 10 trưởng phòng + 30 nhân viên |
| `HopDong` | **100** | Mỗi nhân viên 1 hợp đồng; gồm Chính thức / Thử việc / Thời vụ; có hợp đồng đã hết hạn |
| `ChamCong` | ~3.990 | 2 tháng (9 & 10/2026), bỏ T7/CN, có ca đi trễ / vắng / nghỉ phép |
| `NghiPhep` | **100** | Đủ 4 trạng thái (Chờ duyệt / Đã duyệt / Từ chối); đơn đã duyệt tự đồng bộ vào chấm công |
| `BangLuong` | 180 | Tính bằng SP `SP_TinhLuongThang` cho 2 kỳ (9 & 10/2026) |
| `ChiPhiPhatSinh` | **100** | Trải đều 4 loại: Thưởng / Công tác phí / Phạt / Ứng lương |
| `CongViec` | **100** | Chia đều 25 task mỗi cột Kanban; 4 mức ưu tiên; có task quá hạn |
| `BinhLuan` | **100** | Bình luận trải trên 100 task, nhiều nội dung khác nhau |

Thứ tự nạp trong script rất quan trọng và đã được sắp xếp sẵn:
`PhongBan → ChucVu → NhanVien → TaiKhoan → HopDong → ChamCong → NghiPhep → SP tính lương → ChiPhiPhatSinh → CongViec → BinhLuan`.

Hai điểm dễ sai cần lưu ý:
- **Nghỉ phép** phải `INSERT` với trạng thái `N'Chờ duyệt'` rồi `UPDATE` sang `N'Đã duyệt'`,
  vì trigger `TR_NghiPhep_Update` chỉ chạy khi `UPDATE(TrangThai)` — nếu insert thẳng `Đã duyệt`
  thì bảng chấm công sẽ không được đồng bộ.
- **Bảng lương** phải tính sau khi đã có chấm công, vì `SP_TinhLuongThang` xóa rồi tính lại theo `ChamCong`.

### Kiểm tra nhanh sau khi seed

```sql
SELECT 'NhanVien' AS Bang, COUNT(*) AS SoLuong FROM dbo.NhanVien
UNION ALL SELECT 'CongViec', COUNT(*) FROM dbo.CongViec
UNION ALL SELECT 'BangLuong', COUNT(*) FROM dbo.BangLuong;
```

---

## 🧭 Hướng dẫn sử dụng (theo vai trò)

### 1. Đăng nhập
Mở http://localhost:5173 → nhập `admin` / `Admin@123`. Sidebar tự thay đổi theo vai trò:
**Admin** thấy nhiều menu nhất (kèm *Bảng lương* và *Quản lý tài khoản*), **HR** thấy menu nghiệp vụ
(không có *Bảng lương*, không có *Quản lý tài khoản*), **Nhân viên** chỉ thấy các trang tự phục vụ
(*Tổng quan, Kanban, Chấm công, Nghỉ phép, Bảng lương của mình, Trang cá nhân*).

### 2. Kanban (📋)
- **Kéo thả thẻ** giữa 4 cột `Todo → InProgress → Review → Done`. Hệ thống dùng thứ tự
  gap-based (bước 1000): khi khoảng trống giữa hai thẻ cạn thì tự **rebalance** lại cả cột.
- Thả thẻ vào cột `Done` → trigger `TR_CongViec_Update` tự set `NgayHoanThanh`; kéo ra khỏi
  `Done` → tự xóa `NgayHoanThanh`.
- Click thẻ để mở Drawer chi tiết: bình luận, đổi trạng thái, xem cảnh báo quá hạn.
- Nút **+ Thêm** để tạo task mới (chỉ Admin/HR).
- Ô tìm kiếm + bộ lọc ưu tiên + lọc theo nhân viên ở thanh trên cùng.

### 3. Nhân viên (👥) — chỉ Admin/HR
Tìm theo tên, lọc theo phòng ban / chức vụ / trạng thái, phân trang. Thêm/sửa/xóa nhân viên
(DB có ~100 dòng nên phân trang sẽ hiển thị).

### 4. Chấm công (🕐)
- Nhân viên: nút **Check-in / Check-out** ở tab cá nhân; xem lịch sử công của mình.
- Admin/HR: xem bảng chấm công toàn công ty theo tháng, sửa trạng thái (Trễ / Vắng / Nghỉ phép).
- Ca đi trễ được xác định bởi khung giờ cấu hình (`CauHinhGio`) — xem `ChamCongService`.

### 5. Nghỉ phép (🌴)
Nhân viên gửi đơn (chọn loại phép, từ ngày → đến ngày). Admin/HR duyệt hoặc từ chối.
**Khi duyệt**, trigger tự thêm các ngày nghỉ vào `ChamCong` với trạng thái `Nghỉ phép`,
tự động **bỏ qua Thứ Bảy và Chủ Nhật**.

### 6. Bảng lương (💰)
- Admin bấm **Tính lương** cho tháng/năm → gọi `SP_TinhLuongThang`, tính lại toàn bộ theo chấm công.
- Xem thưởng/phạt/ứng lương ở tab Chi phí phát sinh.
- **Chỉ Admin xem được bảng lương toàn công ty.** Nhân viên chỉ xem phiếu lương của mình
  (kiểm tra quyền ở server, không chỉ ẩn UI).
- Trang này **bị ẩn với vai trò HR** (không có mục menu, vào thẳng URL sẽ bị đẩy sang `/403`).

### 7. Dashboard (📊)
Admin/HR xem KPI toàn công ty; nhân viên chỉ xem số liệu cá nhân (`/api/dashboard/me`).

### Phân quyền cần nhớ khi test
| Thao tác | Admin | HR | Nhân viên |
|---|:---:|:---:|:---:|
| `GET /api/nhanvien` | ✅ | ✅ | ❌ 403 |
| `PUT /api/congviec/{id}/move` — task của mình | ✅ | ✅ | ✅ |
| `PUT /api/congviec/{id}/move` — task người khác | ✅ | ✅ | ❌ 403 |
| `GET /api/bangluong` — bảng lương toàn công ty | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/bangluong/me` — phiếu lương của mình | ✅ | ✅ | ✅ |

---

## 🔐 Phân quyền (RBAC)

| Chức năng | Admin | HR | Nhân viên |
|---|:---:|:---:|:---:|
| Dashboard tổng quan | ✅ | ✅ | ❌ (chỉ xem cá nhân) |
| Quản lý nhân viên | ✅ | ✅ | ❌ |
| Quản lý tài khoản | ✅ | ❌ | ❌ (chỉ trang cá nhân) |
| Kanban — tạo/giao task | ✅ | ✅ | ❌ |
| Kanban — kéo task của mình | ✅ | ✅ | ✅ |
| Chấm công | ✅ | ✅ | ✅ (của mình) |
| Nghỉ phép — duyệt đơn | ✅ | ✅ | ❌ |
| Bảng lương — tính lương | ✅ | ❌ | ❌ |
| Bảng lương — xem | ✅ | ❌ | ✅ (của mình) |

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
- [`tests/README.md`](tests/README.md) — Bộ test tự động (Playwright) + hướng dẫn chạy
- [`TIEN_DO_CHI_TIET.md`](TIEN_DO_CHI_TIET.md) — Nhật ký tiến độ chi tiết

---

## 🧪 Kiểm thử

Hai tầng kiểm thử độc lập:

- **Backend (xUnit)** — project `backend/HRM.Tests` gồm 5 nhóm: `ChamCongServiceTests`,
  `NghiPhepServiceTests`, `ValidatorTests`, `ValidatorCoverageTests`, và `PayrollSqlIntegrationTests`.
  Chạy bằng `dotnet test` trong thư mục `backend`.
- **Frontend/E2E (Playwright)** — trong thư mục `tests/`, chạy `npm test` (xem [`tests/README.md`](tests/README.md)).

**SQL integration tests** (`PayrollSqlIntegrationTests`) mặc định bị **skip**; chúng chỉ chạy khi đặt
biến môi trường `HRM_SQL_TEST=1`. Các test này cần một SQL Server truy cập được và tự tạo rồi DROP một
database tạm (`HRM_Test_<guid>`) — không đụng vào DB `QUANLYNHANSU`:

```powershell
$env:HRM_SQL_TEST=1        # bắt buộc; tùy chọn: $env:HRM_SQL_CONNSTR="Server=...;Database=master;..."
dotnet test --filter "FullyQualifiedName~PayrollSqlIntegrationTests"
```

---

## 👤 Tác giả

**thanhtug07**

- GitHub: [@thanhtug07](https://github.com/thanhtug07)

---

## 📄 Giấy phép

Dự án phát hành theo giấy phép [MIT](https://opensource.org/licenses/MIT).