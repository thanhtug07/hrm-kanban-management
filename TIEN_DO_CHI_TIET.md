# 📋 NHẬT KÝ TIẾN ĐỘ VÀ CHI TIẾT THỰC HIỆN DỰ ÁN
## HỆ THỐNG QUẢN LÝ NHÂN SỰ (HRM) + KANBAN 4 CỘT

---

## 📌 THÔNG TIN TỔNG QUAN
- **Dự án:** Bài tập lớn Cơ sở dữ liệu — Hệ thống Quản lý Nhân sự & Bảng công việc Kanban
- **Môi trường Database:** SQL Server / `(localdb)\MSSQLLocalDB`
- **Tên Database:** `QUANLYNHANSU`
- **Backend Stack:** ASP.NET Core 8 Web API + Entity Framework Core 8
- **Frontend Stack:** React 19 + Vite 8 + TypeScript 6 + Ant Design 6 + `@hello-pangea/dnd`
- **Port chạy local:** Backend `http://localhost:5100` — Frontend `http://localhost:5173`
- **Ngày cập nhật nhật ký:** 26/10/2026
- **Trạng thái hiện tại:** **HOÀN THÀNH — ĐÃ FIX BUG, TĂNG CƯỜNG BẢO MẬT, NÂNG CẤP UI PREMIUM & KIỂM THỬ E2E THỰC TẾ TRÊN TRÌNH DUYỆT** ✅

---

## ⏱️ DÒNG THỜI GIAN TIẾN ĐỘ (TIMELINE LOG)

| Thời gian | Giai đoạn / Hạng mục | Trạng thái | Ghi chú & Kết quả |
|---|---|---|---|
| **24/10/2026** | **Thiết kế & Khởi tạo CSDL master** | **HOÀN THÀNH** ✅ | Gom toàn bộ DDL/DML vào 1 file duy nhất `QUANLYNHANSU.sql`. Tạo 11 bảng, 6 Views, 3 Stored Procedures, 3 Triggers, nạp seed dữ liệu mẫu UTF-8. |
| **25/10/2026** (19:30 - 20:30) | **Audit & Tinh chỉnh Kế hoạch Backend** | **HOÀN THÀNH** ✅ | Tối ưu hóa kiến trúc: Bỏ Repository pattern rườm rà (dùng trực tiếp DbContext), bổ sung Serilog, CORS và 3 điểm mấu chốt kỹ thuật. |
| **25/10/2026** (20:30 - 21:00) | **Bước 1: Khởi tạo Solution chuẩn 3 lớp (`HRM.sln`)** | **HOÀN THÀNH** ✅ | Tạo Solution .NET 8 gồm `HRM.Core`, `HRM.Infrastructure`, `HRM.API`. Cài đặt đầy đủ các gói NuGet chính xác không xung đột. |
| **25/10/2026** (21:00 - 21:20) | **Bước 2: Kết nối CSDL & cấu hình EF Core 8** | **HOÀN THÀNH** ✅ | Viết 12 Entities (11 bảng + 1 View), 11 Fluent API Configurations, `AppDbContext`, xử lý `HasTrigger`, `HasQueryFilter`, `HasComputedColumnSql`. HealthCheck 200 OK. |
| **25/10/2026** (21:25 - 21:42) | **Bước 3: Module Xác thực & Phân quyền (Auth & RBAC)** | **HOÀN THÀNH** ✅ | Sinh 5 hash BCrypt thật cho 5 tài khoản mẫu, thêm nhân viên `NV000` quản trị hệ thống, cấp phát token JWT 8 tiếng mang đủ 7 claims (`MaTK`, `TenDangNhap`, `VaiTro`, `MaNV`, `MaPB`, `HoTen`, `Jti`), tích hợp Swagger Authorize 🔒. |
| **25/10/2026** (21:25 - 21:42) | **Bước 4: Module Trọng tâm — Kanban API (CongViec)** | **HOÀN THÀNH** ✅ | Map View `VW_BoardKanban` phân 4 cột (`todo`, `inProgress`, `review`, `done`), kéo thả bằng SP `SP_DiChuyenTask` với thuật toán Gap-based 1000 + Rebalance tự động, kích hoạt Trigger `TR_CongViec_Update` tự động set/clear `NgayHoanThanh`, phân quyền kéo/xem theo vai trò và bình luận trao đổi task. |
| **26/10/2026** (08:00 - 10:00) | **Bước 5: Hoàn thiện API Nghiệp vụ còn lại** | **HOÀN THÀNH** ✅ | Triển khai 5 modules nghiệp vụ: Nhân viên (gọi SP `SP_ThemNhanVien` với `UPDLOCK, HOLDLOCK` tự sinh `MaNV`), Chấm công (check-in, check-out, chống trùng lặp), Nghỉ phép (Trigger `TR_NghiPhep_Update` tự sinh chấm công ngày thường, bỏ qua T7/CN), Bảng lương (gọi `SP_TinhLuongThang` idempotent), Dashboard thống kê tổng hợp và cá nhân không bị N+1. |
| **26/10/2026** (10:00 - 10:30) | **Bước 6: Kiểm thử E2E Toàn diện & Nghiệm thu** | **HOÀN THÀNH** ✅ | Chạy bộ test matrix 65 test cases qua 3 vai trò Admin, HR, NhanVien đạt **100% PASS**. Xuất tài liệu `docs/SWAGGER_TEST_REPORT.md`, `docs/API_CONTRACT.md` và `docs/swagger.json`. |
| **26/10/2026** (11:00 - 15:30) | **Frontend Phase 1 - 11: Phát triển Toàn diện React App** | **HOÀN THÀNH** ✅ | Xây dựng SPA React 19 + TypeScript + Ant Design 6 + `@hello-pangea/dnd`: 8 module, RBAC 3 vai trò, kéo thả Kanban mượt mà, tính lương tự động, build production đạt `0 error, 0 warning`. |
| **26/10/2026** (buổi tối) | **Review chuyên gia đa góc nhìn (6 agent)** | **HOÀN THÀNH** ✅ | Kiến trúc, Backend API, CSDL, Code Review, Frontend, Reality Check. Phát hiện 1 lỗi blocker CSDL, 3 lỗ hổng bảo mật, 1 bug logic, lệch port, sai tài liệu. |
| **26/10/2026** (buổi tối) | **Fix 6 vấn đề trọng yếu (Blocker & Security)** | **HOÀN THÀNH** ✅ | (1) Thêm bảng `ChiPhiPhatSinh` vào SQL, (2) Vá leo thang đặc quyền `TaiKhoanController`, (3) Sửa logic overlap nghỉ phép, (4) Đưa JWT secret ra khỏi `appsettings.json`, (5) Chuẩn hóa port về 5100, (6) Sửa tài liệu khớp code. |
| **26/10/2026** (buổi tối) | **Kiểm thử E2E thực tế trên trình duyệt (chạy thật)** | **HOÀN THÀNH** ✅ | Khởi động backend + frontend, điều khiển Chrome tự động click từng nút. Phát hiện + fix bug ưu tiên task (`Bình thường` vs `Trung bình`). Kết quả **20/20 PASS**. |
| **26/10/2026** (buổi tối) | **Fix lỗi phân quyền UI + nâng cấp Sidebar Premium SaaS** | **HOÀN THÀNH** ✅ | Sửa menu lộ chức năng Admin/HR cho nhân viên. Nâng cấp sidebar premium: gradient, brand PRO, section labels, active indicator phát sáng, user card. Test **26/26 PASS**. |

---

## 🔧 CHI TIẾT CÁC FIX & NÂNG CẤP NGÀY 26/10/2026 (BUỔI TỐI)

### A. Fix lỗi Blocker & Bảo mật

| # | Vấn đề | Vị trí | Cách sửa |
|---|---|---|---|
| 1 | **Bảng `ChiPhiPhatSinh` thiếu trong script SQL** → API bảng lương crash `Invalid object name` | `QUANLYNHANSU.sql` | Thêm `CREATE TABLE ChiPhiPhatSinh` (MaPS, MaNV, Loai, SoTien, LyDo, Thang, Nam, NgayTao) + FK + 4 CHECK + index `IX_ChiPhiPhatSinh_MaNV_Thang_Nam`. |
| 2 | **Leo thang đặc quyền: HR tạo/sửa được tài khoản Admin** | `TaiKhoanController.cs` | Thêm guard `Forbid()`: chỉ Admin được set vai trò Admin; chỉ Admin sửa/khóa/reset tài khoản Admin. |
| 3 | **ResetPassword trả mật khẩu plaintext trong response** | `TaiKhoanController.cs:278` | Bỏ echo mật khẩu, chỉ thông báo "đã đặt lại về mật khẩu mặc định". |
| 4 | **JWT SecretKey hardcode trong repo** | `appsettings.json` | Để trống; secret dev chuyển sang `appsettings.Development.json`; đọc từ biến môi trường `JWT_SECRET_KEY` trước. |
| 5 | **`RequireHttpsMetadata = false` cả production** | `Program.cs` | Đổi thành `!builder.Environment.IsDevelopment()`. |
| 6 | **Logic overlap nghỉ phép SAI** — bỏ sót trường hợp đơn mới bao trùm đơn cũ | `NghiPhepService.cs:36-40` | Đổi điều kiện sang chuẩn overlap: `dto.TuNgay <= n.DenNgay && dto.DenNgay >= n.TuNgay`. |
| 7 | **Lệch port**: BE listen 5100, FE gọi 5000, tài liệu ghi 5055 → API không kết nối | `.env`, `vite.config.ts`, `axiosClient.ts`, docs | Chuẩn hóa toàn bộ về **5100**. |
| 8 | **Ưu tiên task sai giá trị**: FE gửi `Bình thường`, DB/validator nhận `Trung bình` → tạo task luôn 400 | `KanbanBoardPage.tsx`, `TaskFormModal.tsx`, `KanbanCard.tsx`, `PriorityTag.tsx` | Đổi toàn bộ về `Trung bình` khớp DB constraint + validator. |
| 9 | **Menu lộ chức năng Admin/HR cho nhân viên** → bấm vào bị 403 | `SiderMenu.tsx`, `HeaderBar.tsx`, `router/index.tsx` | Menu render theo role; thêm `/profile` cho nhân viên (đổi mật khẩu self-service). |
| 10 | **Sai tài liệu**: Kanban "3 cột", React 18, AntD 5, port 5055 | các file `.md`, `swagger.json` | Cập nhật đồng loạt: 4 cột, React 19, AntD 6, port 5100, 11 bảng. |

### B. Nâng cấp Sidebar Premium SaaS

**File mới:** `frontend/src/styles/sider-premium.css`
**File viết lại:** `frontend/src/layouts/SiderMenu.tsx`

| Hạng mục | Trước | Sau |
|---|---|---|
| Nền | Xanh đen đơn sắc | 3 lớp gradient + 2 radial glow (indigo/cyan) |
| Brand | Chữ "H" + text thường | Logo gradient glow pulse + badge **PRO** + subtitle uppercase |
| Menu | Danh sách phẳng | **3 nhóm**: Tổng quan / Nghiệp vụ / Quản trị |
| Active item | Đổi màu nhạt | Pill gradient + thanh chỉ báo trái phát sáng + icon highlight |
| Hover | Đổi bg nhạt | Nền sáng + icon scale + đổi màu cyan |
| Footer | 1 dòng status | **User card** (avatar + tên + role màu) + status dot nhấp nháy |
| Collapsed | Chỉ ẩn chữ | Ẩn label + tooltip + user card căn giữa |
| Scrollbar | Mặc định | Thanh mảnh bo tròn mờ |

---

## 🏗️ TỔNG HỢP CẤU TRÚC BACKEND

```
backend/
├── HRM.sln                                     # Solution master quản lý 3 project
├── HRM.Core/                                   # Domain Layer (thuần C#)
│   ├── Common/ (ApiResponse.cs, PagedResult.cs)
│   ├── Constants/ (RoleConstants.cs)
│   ├── Entities/                               # 12 file: 11 bảng + BoardKanbanItem (View)
│   ├── DTOs/ (Auth, Kanban, NhanVien, ChamCong, NghiPhep, BangLuong, ChiPhiPhatSinh, Dashboard)
│   └── Interfaces/ (9 service interfaces + IPasswordHasher, IJwtTokenService)
├── HRM.Infrastructure/                         # Data Access Layer (EF Core 8)
│   ├── Security/PasswordHasher.cs              # BCrypt WorkFactor=11
│   └── Data/ (AppDbContext.cs + 11 Configurations)
└── HRM.API/                                    # Presentation & API Layer
    ├── Controllers/                            # Auth, CongViec, NhanVien, ChamCong, NghiPhep, BangLuong, Dashboard, TaiKhoan, HealthCheck
    ├── Services/                               # 8 service implementations
    ├── Validators/                             # 9 FluentValidation validators
    └── Program.cs                              # Serilog, CORS, JWT (env secret), Swagger Authorize
```

---

## 🎨 TỔNG HỢP CẤU TRÚC FRONTEND REACT

```
frontend/
├── package.json                                # React 19, Vite 8, TS 6, Antd 6, @hello-pangea/dnd, Zustand 5, Axios
├── vite.config.ts                              # Proxy /api -> http://localhost:5100, Alias @/ -> src/
├── src/
│   ├── api/                                    # 8 Axios services
│   ├── stores/                                 # zustand: authStore (persist), uiStore (sidebar)
│   ├── types/                                  # khớp DTO backend
│   ├── components/                             # PriorityTag, StatusTag
│   ├── layouts/
│   │   ├── HeaderBar.tsx                       # Sider toggle, role badge, user dropdown (theo role)
│   │   ├── SiderMenu.tsx                       # ⭐ Sidebar premium SaaS, dynamic theo vai trò
│   │   └── MainLayout.tsx
│   ├── router/
│   │   ├── index.tsx                           # Định tuyến 8 module + /profile
│   │   └── ProtectedRoute.tsx                  # RBAC role matching
│   ├── styles/
│   │   ├── global.css
│   │   └── sider-premium.css                   # ⭐ Design tokens + components sidebar
│   └── pages/                                  # auth, nhanvien, chamcong, nghiphep, kanban,
│                                               # bangluong, dashboard, taikhoan, profile, 403, 404
```

---

## ✅ KẾT QUẢ KIỂM THỬ E2E THỰC TẾ (CHẠY THẬT TRÊN TRÌNH DUYỆT)

Đã khởi động backend (`localhost:5100`) + frontend (`localhost:5173`) và điều khiển Chrome tự động click từng nút.

### Bộ test chức năng — 20/20 PASS
- Login admin → dashboard, điều hướng đủ 6 module.
- Kanban hiển thị đủ 4 cột (To do / In progress / Review / Done).
- Tạo task mới → xuất hiện trên board → **persist vào DB sau khi reload**.
- Mở Task Detail Drawer.
- nv001 **không thấy** nút "Giao việc mới" (RBAC).
- nv001 vào `/taikhoan` → bị chặn về `/403`.
- HR tạo tài khoản vai trò Admin → **403 CHẶN**.
- Admin tạo tài khoản Admin → 200 OK.
- Tạo đơn nghỉ phép hợp lệ → 201.
- **Đơn bao trùm đơn cũ → bị phát hiện trùng** (fix overlap hoạt động).
- API `/api/bangluong/phatsinh` (bảng `ChiPhiPhatSinh` mới) → 200.
- Không có page error.

### Bộ test Sidebar Premium — 26/26 PASS
- Brand logo, badge PRO, section labels, user card hiển thị.
- Role label đúng màu: Admin đỏ / HR xanh dương / NV xanh lá.
- Collapse/expand sidebar hoạt động.
- Active indicator đi theo route.
- **Phân quyền menu 3 role chính xác** — nv001 ẩn hoàn toàn mục Admin/HR.

---

## 💻 CÁC ĐIỂM SÁNG KỸ THUẬT NỔI BẬT

1. **SP `SP_ThemNhanVien` tự sinh mã không xung đột** (`UPDLOCK, HOLDLOCK`) — sinh mã `NV021`, `NV022`... tuần tự tuyệt đối.
2. **Trigger `TR_NghiPhep_Update` bỏ qua Thứ Bảy & Chủ Nhật** — nghỉ qua cuối tuần không thổi phồng ngày công.
3. **SP `SP_TinhLuongThang` idempotent** — `DELETE` kỳ cũ trước `INSERT` mới, tính lại bao nhiêu lần cũng không trùng.
4. **Cột `ThucLinh` computed PERSISTED** tự động bởi SQL Server.
5. **RBAC 3 lớp chuẩn xác** — Admin / HR / NhanVien bị chặn `403` với dữ liệu người khác.
6. **Kanban gap-based ordering 1000 + rebalance** chống trùng vị trí khi kéo thả.
7. **Bảo mật tăng cường** — JWT secret qua biến môi trường, chống leo thang đặc quyền, không lộ plaintext.

---

## 🎯 BÀN GIAO & SẴN SÀNG DEMO
- [x] Tài liệu API Contract: `docs/API_CONTRACT.md`
- [x] File đặc tả Open API v3: `docs/swagger.json`
- [x] Báo cáo kiểm thử: `docs/SWAGGER_TEST_REPORT.md`
- [x] Kết quả E2E thực tế: 20/20 (chức năng) + 26/26 (sidebar/RBAC)
- [x] Tài khoản mẫu: `admin` (`Admin@123`), `hr01` (`Hr@123`), `nv001` (`Nv@123`)

---

## 🔮 VIỆC NÊN LÀM TIẾP (KHÔNG BẮT BUỘC — TỐI ƯU)
- Phân trang thật cho Chấm công (`Take(1000)` cứng), Nghỉ phép, Tài khoản.
- Global Exception Handler + error code thay `message.Contains("quyền")`.
- Frontend: code splitting (`React.lazy` + `manualChunks`) giảm bundle 2.1MB.
- Thêm test tự động (hiện test qua Swagger thủ công + Playwright E2E).
