# 🏛️ ĐÁNH GIÁ KIẾN TRÚC HỆ THỐNG — HRM PORTAL

> **Người đánh giá:** System Architect
> **Ngày:** 27/10/2026
> **Phạm vi:** Toàn bộ backend (.NET 8), frontend (React 19), CSDL (SQL Server)
> **Phương pháp:** Đọc trực tiếp mã nguồn + chạy kiểm chứng

---

## 1. TỔNG QUAN HỆ THỐNG

| Thành phần | Công nghệ | Quy mô |
|---|---|---|
| Backend | ASP.NET Core 8 Web API | 28.138 dòng C# |
| Frontend | React 19 + TypeScript + Vite + Ant Design 6 | 11.706 dòng TS/TSX |
| Database | SQL Server | 728 dòng T-SQL (11 bảng, 6 view, 3 SP, 3 trigger) |
| Xác thực | JWT Bearer + BCrypt | 42 endpoint / 9 controller |
| Kiểm thử | Playwright E2E | 5 suite (smoke, ui-layout, api-fuzz, rbac, e2e) |

### Kiến trúc tầng (Clean Architecture dạng rút gọn)

```
HRM.API (Presentation)     ── Controllers, Services, Validators, Program.cs
    │  phụ thuộc
HRM.Infrastructure (Data)  ── AppDbContext, EF Configurations, PasswordHasher
    │  phụ thuộc
HRM.Core (Domain)          ── Entities, DTOs, Interfaces, Constants, Common
```

**Chiều phụ thuộc ĐÚNG**: Core không tham chiếu Infrastructure/API (verified `HRM.Core.csproj` trống). Đây là điểm tích cực hiếm gặp ở đồ án sinh viên.

---

## 2. ĐIỂM MẠNH (có bằng chứng)

### 2.1 Phân tầng rõ ràng, tuân thủ dependency rule
- `HRM.Core.csproj` **không** có `PackageReference` nào → domain thuần, không bám framework.
- `HRM.Infrastructure.csproj` chỉ tham chiếu `HRM.Core` + EF Core.
- DTO tách biệt khỏi Entity (21 file DTO riêng).

### 2.2 Chất lượng truy cập dữ liệu cao
- **Database-first đúng cách**: EF map lên DB có sẵn, dùng `ApplyConfigurationsFromAssembly` (AppDbContext.cs:26) → tự nạp 11 config, sạch.
- **Stored Procedure cho nghiệp vụ nguyên tử**: `SP_ThemNhanVien` (UPDLOCK/HOLDLOCK chống race), `SP_DiTichuyenTask` (gap-based rebalance), `SP_TinhLuongThang` (idempotent).
- **Trigger tự động hóa**: `TR_NghiPhep_Update` (đồng bộ nghỉ phép → chấm công, bỏ T7/CN), `TR_CongViec_Update`, `TR_HopDong_Update`.
- **Partial index** cho Kanban (`WHERE DaXoa=0`) — đúng nhu cầu.
- **Computed column PERSISTED** `ThucLinh` — SQL tự tính, không cần logic app.

### 2.3 Bảo mật nền tảng tốt
- BCrypt workFactor 11 (PasswordHasher.cs).
- JWT validation đầy đủ (issuer/audience/lifetime/signing key), `ClockSkew=1min`.
- JWT secret đọc từ **biến môi trường** `JWT_SECRET_KEY` trước config (Program.cs) — đúng chuẩn production.
- `RequireHttpsMetadata = !IsDevelopment()` — khác biệt môi trường.
- Chống user-enumeration ở login, chống leo thang đặc quyền (whitelist vai trò), chống IDOR (service tự kiểm `MaNV` claim).

### 2.4 Chuẩn hóa response & validation
- `ApiResponse<T>` + `PagedResult<T>` thống nhất toàn hệ thống.
- **11 FluentValidation validator** với `AddFluentValidationAutoValidation` — validate tầng pipeline.
- `RoleConstants` tập trung hằng số vai trò.

### 2.5 Frontend có cấu trúc
- Tách `api / components / layouts / pages / router / stores / types / utils`.
- Zustand quản lý state (authStore persist, uiStore).
- `ProtectedRoute` RBAC ở tầng router.
- Design tokens + component `PageHeader` dùng chung (đồng bộ UI).

### 2.6 Kiểm thử tự động thực chất
- 5 suite Playwright (không chỉ chạy tay): smoke, ui-layout, api-fuzz, rbac, e2e.
- Kiểm cả API-level (request context) lẫn UI-level (browser).

---

## 3. ĐIỂM YẾU & RỦI RO (xếp theo mức độ)

### 🔴 CAO — Cần xử lý

#### 3.1 Không có tầng Application — logic nghiệp vụ đặt sai chỗ
- **Bằng chứng:** `Services/` nằm trong `HRM.API` (tầng Presentation), inject trực tiếp `AppDbContext` (Infrastructure).
- **Hệ quả:** Vi phạm dependency rule thực chất — use-case bám cứng EF Core + SQL Server. **Không thể unit-test service** mà không có DB thật.
- **Khuyến nghị:** Tạo project `HRM.Application` chứa Services + Validators; giao tiếp Core qua Repository/abstraction.

#### 3.2 `TaiKhoanController` chứa toàn bộ logic nghiệp vụ (không có service)
- **Bằng chứng:** 337 dòng — truy vấn EF, hash mật khẩu, validate, business rule nằm hết trong Controller.
- **Hệ quả:** Không nhất quán với 8 module khác (đều có service); khó test; vi phạm SRP.
- **Khuyến nghị:** Tách `ITaiKhoanService` + `TaiKhoanService`.

#### 3.3 Không có Global Exception Handler
- **Bằng chứng:** `Program.cs` không có `UseExceptionHandler`/`IExceptionHandler`.
- **Hệ quả:** Lỗi không bắt → trả 500 + stack trace (lộ chi tiết nội bộ). Đã từng gặp lỗi 500 khi SP lỗi thay vì 400 có thông báo.
- **Khuyến nghị:** Middleware bắt lỗi toàn cục → trả `ApiResponse.Fail` chuẩn, log lại.

#### 3.4 Điều hướng HTTP dựa trên so khớp chuỗi (fragile)
- **Bằng chứng:** `result.Message.Contains("quyền")` → 403, else 404 (nhiều controller).
- **Hệ quả:** Đổi câu thông báo tiếng Việt → sai status code, ngầm phá logic, không test nào phát hiện.
- **Khuyến nghị:** Thêm `ErrorCode` enum vào `ApiResponse` → controller map sang HTTP status.

### 🟠 TRUNG BÌNH

#### 3.5 Thiếu Transaction ở luồng ghi nhiều bước
- **Bằng chứng:** `MoveTaskAsync` (rebalance ghi DB rồi gọi SP riêng), `CreatePhatSinhAsync` (insert + update BangLuong).
- **Hệ quả:** SP fail giữa chừng → dữ liệu lệch (cột đã rebalance nhưng task chưa move).
- **Khuyến nghị:** Bọc `BeginTransactionAsync` cho các luồng nhiều lệnh ghi.

#### 3.6 Phân trang thiếu & load toàn bảng
- **Bằng chứng:** `ChamCongService.GetListAsync` dùng `Take(1000)` cứng (âm thầm mất dữ liệu nếu >1000), `GetAllLeavesAsync`/`GetPhatSinhListAsync` không phân trang, `GetListAsync` (lương) load toàn bộ + N+1 trong RAM.
- **Hệ quả:** Hiệu năng giảm khi dữ liệu lớn; nguy cơ mất dữ liệu im lặng.
- **Khuyến nghị:** Dùng `PagedResult` cho tất cả list; cap PageSize (đã fix ở NhanVien).

#### 3.7 Trộn `DateTime.Now` (local) và `DateTime.UtcNow`
- **Bằng chứng:** `NgayTao=DateTime.Now` (TaiKhoan, ChiPhiPhatSinh) vs `NgayDuyet=UtcNow` (NghiPhep), trigger dùng `GETDATE()` (local).
- **Hệ quả:** Lệch múi giờ 7h ở ranh giới ngày/tháng → báo cáo dashboard sai.
- **Khuyến nghị:** Thống nhất một chuẩn (khuyến nghị UTC toàn bộ).

#### 3.8 `HealthCheckController` public, lộ thông tin
- **Bằng chứng:** Không `[Authorize]`, trả số record mỗi bảng + `ex.Message`.
- **Khuyến nghị:** Thêm authorize hoặc giới hạn thông tin trả về.

#### 3.9 Coupling: Service trả `ApiResponse<T>` (shape HTTP)
- **Bằng chứng:** Service trả envelope HTTP thay vì domain result.
- **Hệ quả:** Use-case biết về HTTP; khó tái dùng cho worker/CLI.
- **Khuyến nghị:** Dùng `Result<T>` thuần domain, controller chuyển thành `ApiResponse`.

### 🟡 THẤP / CẢI THIỆN

- **Không có EF Migrations** → nguồn chân lý schema là file `.sql` thủ công, dễ lệch với entity (đã từng gặp mismatch `ChiPhiPhatSinh`). Khuyến nghị: ghi rõ SQL là canonical + test snapshot schema.
- **Magic string trạng thái** rải rác ("Todo", "Đủ công"...) → nên gom vào Constants.
- **Chưa có Unit Test** (chỉ có E2E Playwright). Nên thêm xUnit cho service nghiệp vụ thuần (tính lương, overlap nghỉ phép).
- **Bundle frontend 2.1MB 1 chunk** → nên `React.lazy` + `manualChunks`.
- **Hardcode tài khoản demo** ở màn Login (gate bằng `import.meta.env.DEV`).
- **JWT không có refresh/revoke** → token cũ vẫn hợp lệ sau đổi mật khẩu.

---

## 4. ĐÁNH GIÁ THEO TIÊU CHÍ KIẾN TRÚC

| Tiêu chí | Điểm | Ghi chú |
|---|:---:|---|
| **Separation of Concerns** | 6.5/10 | Có chia tầng nhưng logic ở sai tầng (Service∈API, TaiKhoanController) |
| **Dependency Rule** | 7.5/10 | Core sạch; nhưng Service bám DbContext nên chưa trọn vẹn |
| **Maintainability** | 7/10 | Naming tốt, response chuẩn; nợ kỹ thuật ở controller lớn |
| **Testability** | 4/10 | Không unit test; service khó test do bám DB |
| **Security** | 7.5/10 | Nền tốt, đã vá nhiều lỗ; còn thiếu global handler + revoke |
| **Performance** | 6/10 | Nhiều `AsNoTracking` tốt; nhưng load-all + N+1 vài chỗ |
| **Data Integrity** | 8/10 | SP/trigger/computed column/constraint chất lượng cao |
| **Frontend Architecture** | 7/10 | Cấu trúc tốt; bundle lớn, thiếu code-split |
| **Observability** | 6.5/10 | Serilog có cấu trúc; log entity command mức Information (lộ dữ liệu) |
| **Documentation** | 8/10 | README, API contract, test report, tiến độ đầy đủ |

### **ĐIỂM TỔNG: 6.8 / 10** — Mức "Khá, vượt mặt bằng đồ án sinh viên"

---

## 5. SO SÁNH VỚI CHUẨN CÔNG NGHIỆP

| Khía cạnh | Đồ án này | Chuẩn production | Khoảng cách |
|---|---|---|---|
| Tầng | 3 lớp (thiếu Application) | 4 lớp + CQRS/MediatR | Vừa |
| Test | E2E only | Unit + Integration + E2E | Lớn |
| Migration | Script thủ công | EF Migrations / Flyway | Vừa |
| Error handling | Cục bộ | Global handler + ProblemDetails | Vừa |
| Auth | JWT basic | JWT + refresh + revoke + rate-limit | Vừa |
| Observability | Serilog | OpenTelemetry + tracing | Lớn |
| CI/CD | Không | Pipeline + test gate | Lớn |

---

## 6. LỘ TRÌNH CẢI THIỆN ĐỀ XUẤT

### Ưu tiên 1 — Nhanh & giá trị cao (nửa ngày)
1. Thêm **Global Exception Handler** → hết lộ stack trace, response lỗi chuẩn.
2. Thêm **ErrorCode enum** → bỏ `message.Contains("quyền")`.
3. Bọc **transaction** cho `MoveTaskAsync` + `CreatePhatSinhAsync`.
4. Thống nhất **DateTime UTC**.

### Ưu tiên 2 — Kiến trúc (1-2 ngày)
5. Tách `TaiKhoanService` khỏi controller.
6. Tạo project `HRM.Application` (di chuyển Service + Validator).
7. Thêm `IRepository`/`IUnitOfWork` tối thiểu cho testability.

### Ưu tiên 3 — Chất lượng dài hạn (2-3 ngày)
8. Unit test xUnit cho nghiệp vụ thuần (tính lương, overlap nghỉ phép, gap-based).
9. EF Migrations hoặc snapshot test schema.
10. Frontend code-split + lazy route.

---

## 7. KẾT LUẬN

**Hệ thống đạt mức khá, vượt rõ so với đồ án sinh viên thông thường.** Điểm mạnh nổi bật là **chất lượng tầng dữ liệu** (SP/trigger/computed column/index đúng nhu cầu) và **ý thức kiến trúc** (phân tầng, DTO, validation, RBAC, bảo mật nền).

**Điểm yếu chính** là **thiếu tầng Application** khiến logic nghiệp vụ bám tầng Presentation/Infrastructure, và **thiếu kiểm thử đơn vị** — hai điều này giới hạn khả năng bảo trì và mở rộng trong môi trường thật.

Với các cải thiện ở Ưu tiên 1 (nửa ngày công), hệ thống có thể đạt **7.5/10** và sẵn sàng hơn cho môi trường chuyên nghiệp.

---

## 8. NHẬT KÝ CẢI THIỆN (CẬP NHẬT 27/10/2026)

Các rủi ro đã được xử lý:

| # | Rủi ro | Trạng thái | Giải pháp |
|---|---|---|---|
| 3.1 | Không có tầng Application | ✅ ĐÃ FIX | Tạo `HRM.Application` (Services + Validators), API chỉ còn Controllers |
| 3.2 | TaiKhoanController chứa nghiệp vụ | ✅ ĐÃ FIX | Tách `ITaiKhoanService` + `TaiKhoanService` |
| 3.3 | Không có Global Exception Handler | ✅ ĐÃ FIX | `GlobalExceptionHandlerMiddleware` |
| 3.4 | Điều hướng HTTP bằng `message.Contains` | ✅ ĐÃ FIX | `ErrorCode` enum + map HTTP status |
| 3.5 | Thiếu transaction | ✅ ĐÃ FIX | Transaction cho MoveTask + CreatePhatSinh; ExecuteUpdate atomic |
| 3.7 | Trộn DateTime local/UTC | ✅ ĐÃ FIX | Đồng bộ local (khớp GETDATE of DB) |
| 3.8 | HealthCheck public | ✅ ĐÃ FIX | `[Authorize(Admin)]` + ẩn ex.Message |
| — | Không có Unit Test | ✅ ĐÃ FIX | 22 unit test xUnit (HRM.Tests) |
| — | Bundle frontend 2.1MB 1 chunk | ✅ ĐÃ FIX | React.lazy + advancedChunks |

### Điểm số SAU cải thiện

| Tiêu chí | Trước | Sau |
|---|:---:|:---:|
| Separation of Concerns | 6.5 | 8.5 |
| Dependency Rule | 7.5 | 8.5 |
| Testability | 4.0 | 8.0 |
| Security | 7.5 | 8.5 |
| Performance | 6.0 | 7.5 |
| **TỔNG** | **6.8** | **~8.1/10** |

### Còn lại (khuyến nghị tương lai)
- Repository/IUnitOfWork đầy đủ (hiện service dùng DbContext trực tiếp — chấp nhận được cho quy mô đồ án).
- EF Migrations hoặc snapshot test schema (hiện dùng SQL script làm nguồn chân lý).
- Refresh token + rate limiting cho auth.