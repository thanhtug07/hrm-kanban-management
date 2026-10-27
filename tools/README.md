# 🗄️ DB Viewer — Xem CSDL kiểu phpMyAdmin

Giao diện web xem toàn bộ CSDL `QUANLYNHANSU` trong trình duyệt — giống **phpMyAdmin / XAMPP**.
Click từng bảng để xem dữ liệu, số dòng **tự cập nhật realtime** mỗi 3 giây.

## Yêu cầu
- **Python 3** (đã có sẵn trên máy) + thư viện `pyodbc`, `flask`
- **ODBC Driver 17 for SQL Server** (đã có sẵn)
- SQL Server / LocalDB đang chạy, DB `QUANLYNHANSU` đã tạo

Cài thư viện (1 lần):

```bash
pip install pyodbc flask
```

## Cách chạy

**Cách 1 — Nhấp đúp (dễ nhất):**

Mở thư mục `tools/`, nhấp đúp:

```
db_viewer.bat
```

Trình duyệt tự mở **http://localhost:8000**.

**Cách 2 — Chạy trong terminal:**

```bash
cd tools
python db_viewer.py
```

## Tính năng
- **Trang chủ**: liệt kê toàn bộ 11 bảng + số dòng, kèm 6 view. Số dòng **tự nhảy** khi có thay đổi.
- **Chi tiết bảng**: click vào bảng → xem dữ liệu dạng bảng, phân trang (50 dòng/trang).
- **Realtime**: mở sẵn viewer, thao tác trên app → số dòng cập nhật sau vài giây.

## Tùy chỉnh kết nối

Đặt biến môi trường nếu SQL Server của bạn khác:

```bat
set DB_SERVER=(localdb)\MSSQLLocalDB
set DB_NAME=QUANLYNHANSU
set DB_DRIVER=ODBC Driver 17 for SQL Server
set DB_VIEWER_PORT=8000
python db_viewer.py
```

## Cách xem realtime song song với app
1. Chạy `db_viewer.bat` → mở **http://localhost:8000** (để tab này bên cạnh).
2. Chạy backend + frontend app → **http://localhost:5173**.
3. Thao tác trên app (tạo nhân viên, chấm công, tạo task...).
4. Quay lại tab viewer — số dòng + dữ liệu đã nhảy.

> 💡 Muốn xem chi tiết thì click vào bảng tương ứng (ví dụ `TaiKhoan`, `NhanVien`) và bấm F5 để làm mới.

---

## 🩺 Health Check — Kiểm tra sức khỏe hệ thống

Công cụ kiểm tra chi tiết: SQL Server, Database, schema, dữ liệu, ràng buộc, và Backend API.

### Cách dùng

**Cách 1 — Nhấp đúp:**
```
tools\health_check.bat
```

**Cách 2 — PowerShell:**
```powershell
cd tools
.\HEALTH_CHECK.ps1
```

### Tùy chọn

```powershell
.\HEALTH_CHECK.ps1 -Server "localhost" -Database "QUANLYNHANSU" -ApiUrl "http://localhost:5100"
.\HEALTH_CHECK.ps1 -Json          # in JSON
```

### Kiểm tra gì

| Mục | Nội dung |
|---|---|
| 1. SQL Server | Kết nối, version, edition, service |
| 2. Database | Tồn tại, trạng thái ONLINE |
| 3. Schema | Số bảng (>=11), view (>=6), SP (>=3), trigger (>=3), index |
| 4. Dữ liệu | Đếm dòng từng bảng + tài khoản theo vai trò |
| 5. Ràng buộc | FK, CHECK, FK thiếu index |
| 6. Cấu hình | Khung giờ chấm công |
| 7. Backend API | API sống, đăng nhập admin |

Kết quả: liệt kê `[OK]`/`[!]`/`[X]` + tổng kết PASS/WARN/FAIL. Báo cáo JSON lưu vào `tools\health-report.json`.