# 🗄️ DB Live Monitor

Công cụ theo dõi CSDL `QUANLYNHANSU` **theo thời gian thực** — tự động chạy lại query và
refresh màn hình mỗi vài giây, giúp bạn thấy dữ liệu thay đổi ngay khi thao tác trên app.

## Cách dùng

**Cách 1 — Nhấp đúp (dễ nhất):**

Mở thư mục `tools/`, nhấp đúp file:

```
DB_LIVE_MONITOR.bat
```

**Cách 2 — Chạy trong PowerShell:**

```powershell
cd tools
.\DB_LIVE_MONITOR.ps1
```

## Tùy chọn

| Tham số | Mặc định | Mô tả |
|---|---|---|
| `-Interval <giây>` | `3` | Chu kỳ refresh (giây) |
| `-Server "<tên>"` | `(localdb)\MSSQLLocalDB` | SQL Server instance |
| `-Database "<tên>"` | `QUANLYNHANSU` | Tên database |
| `-Tables "A","B"` | toàn bộ bảng | Chỉ xem vài bảng cụ thể |
| `-Once` | — | Chạy 1 lần rồi thoát (không lặp) |

Ví dụ:

```powershell
# Xem nhanh chỉ bảng tài khoản và nhân viên, refresh 2 giây/lần
.\DB_LIVE_MONITOR.ps1 -Interval 2 -Tables "TaiKhoan","NhanVien"

# Chạy 1 lần để chụp ảnh nhanh
.\DB_LIVE_MONITOR.ps1 -Once
```

## Màn hình hiển thị gì

1. **Tổng quan** — số dòng mỗi bảng (thay đổi ngay khi thêm/xóa).
2. **Chi tiết từng bảng** — toàn bộ bảng nghiệp vụ: `TaiKhoan`, `NhanVien`, `PhongBan`,
   `ChucVu`, `ChamCong`, `NghiPhep`, `BangLuong`, `ChiPhiPhatSinh`, `CongViec`, `BinhLuan`, `HopDong`.

Nhấn **Ctrl+C** để dừng.

## Mẹo: xem realtime song song với app

1. Mở cửa sổ **DB Live Monitor** bên trái (để nguyên chạy).
2. Mở trình duyệt app (`http://localhost:5173`) bên phải.
3. Thao tác trên app (tạo nhân viên, chấm công, tạo task...).
4. Nhìn sang cửa sổ monitor — số dòng sẽ nhảy ngay trong vài giây.

> 💡 Nếu console hiển thị tiếng Việt bị lỗi font, đảm bảo terminal dùng UTF-8
> (file `.bat` đã tự set `chcp 65001`). Với Windows Terminal / PowerShell 7 hiển thị đẹp nhất.
