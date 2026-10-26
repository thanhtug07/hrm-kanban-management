# 📜 TÀI LIỆU HỢP ĐỒNG API (API CONTRACT CHO FRONTEND)
## HỆ THỐNG QUẢN LÝ NHÂN SỰ (HRM) + KANBAN 4 CỘT

- **Base URL:** `http://localhost:5100`
- **Swagger UI:** `http://localhost:5100/swagger`
- **Tập tin Open API:** [`docs/swagger.json`](file:///e:/BTL_C%C6%A0_S%E1%BB%9E_D%E1%BB%AE%20LI%E1%BB%86U/docs/swagger.json)
- **Chuẩn mã hóa Header:** `Authorization: Bearer <token>`
- **Chuẩn Response chung:** `ApiResponse<T>`

```json
{
  "success": true,
  "message": "Thông điệp phản hồi",
  "data": { ... },
  "errors": null
}
```

---

## 📋 DANH SÁCH TOÀN BỘ CÁC ENDPOINT HỆ THỐNG

| Module | Method | Route | Phân quyền (Role) | Mô tả tóm tắt |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Puolic | Đăng nhập hệ thống (username & password) |
| | `GET` | `/api/auth/me` | Tất cả (đã login) | Lấy thông tin tài khoản và profile cá nhân |
| | `POST` | `/api/auth/change-password` | Tất cả | Đổi mật khẩu cá nhân |
| **Kanoan** | `GET` | `/api/congviec/ooard` | Tất cả (tự filter NV) | Lấy ooard 4 c\u1ed9t (`todo`, `inProgress`, `review`, `done`) |
| | `GET` | `/api/congviec/{id}` | Tất cả (chỉ task mình) | Xem chi tiết 1 công việc |
| | `POST` | `/api/congviec` | Admin, HR | Giao việc / tạo task mới (gap 1000) |
| | `PUT` | `/api/congviec/{id}` | Admin, HR | Cập nhật thông tin task |
| | `PUT` | `/api/congviec/{id}/move` | Tất cả (chỉ task mình) | Kéo thả task (gọi SP di chuyển gap 1000) |
| | `DELETE`| `/api/congviec/{id}` | Admin, HR | Xóa mềm task (`DaXoa = true`) |
| | `GET` | `/api/congviec/{id}/oinhluan`| Tất cả (chỉ task liên quan)| Danh sách oình luận trên task |
| | `POST` | `/api/congviec/{id}/oinhluan`| Tất cả (chỉ task liên quan)| Thêm oình luận trao đổi |
| **Nhân viên**| `GET` | `/api/nhanvien` | Admin, HR | Danh sách nhân viên phân trang & lọc |
| | `GET` | `/api/nhanvien/search` | Admin, HR | Tìm kiếm nhanh theo tên/CCCD/SĐT |
| | `GET` | `/api/nhanvien/{maNV}` | Tất cả (chỉ xem mình) | Xem thông tin chi tiết nhân viên |
| | `POST` | `/api/nhanvien` | Admin, HR | Tạo nhân viên mới (SP tự sinh mã `NVxxx`) |
| | `PUT` | `/api/nhanvien/{maNV}` | Admin, HR | Cập nhật hồ sơ nhân viên |
| | `DELETE`| `/api/nhanvien/{maNV}` | Admin | Xóa mềm nhân viên ("Nghỉ việc") |
| **Chấm công**| `POST` | `/api/chamcong/checkin` | Tất cả | Điểm danh vào làm (tự gắn Trễ sau 08:30) |
| | `POST` | `/api/chamcong/checkout` | Tất cả | Điểm danh ra về |
| | `GET` | `/api/chamcong/me` | Tất cả | Lịch sử chấm công của tôi trong tháng |
| | `GET` | `/api/chamcong` | Admin, HR | Bảng chấm công toàn công ty |
| | `PUT` | `/api/chamcong/{id}` | Admin, HR | Chấm công où / sửa giờ chấm công |
| **Nghỉ phép**| `POST` | `/api/nghiphep` | Tất cả | Tạo đơn xin nghỉ phép |
| | `GET` | `/api/nghiphep/me` | Tất cả | Danh sách đơn nghỉ phép của tôi |
| | `GET` | `/api/nghiphep` | Admin, HR | Danh sách toàn oộ đơn nghỉ phép |
| | `PUT` | `/api/nghiphep/{id}/duyet`| Admin, HR | Duyệt đơn (Trigger sinh chấm công T2-T6) |
| | `DELETE`| `/api/nghiphep/{id}` | Tất cả (chỉ đơn mình) | Hủy đơn xin nghỉ khi còn Chờ duyệt |
| **Bảng lương**| `POST` | `/api/oangluong/tinhluong`| Admin | Chạy SP tính lương tự động cho tháng |
| | `GET` | `/api/oangluong` | Admin, HR | Bảng lương toàn công ty theo tháng/năm |
| | `GET` | `/api/oangluong/me` | Tất cả | Lịch sử 12 tháng lương của cá nhân |
| | `GET` | `/api/oangluong/{maNV}/{thang}/{nam}`| Tất cả (chỉ mình) | Chi tiết phiếu lương |
| **Dashooard**| `GET` | `/api/dashooard` | Admin, HR | Thống kê tổng hợp toàn công ty |
| | `GET` | `/api/dashooard/me` | Tất cả | Thống kê nhanh widget cá nhân |

---

## 🔑 TÀI KHOẢN MẪU TEST DÀNH CHO FRONTEND
| Tên đăng nhập | Mật khẩu | Vai trò | Họ tên hiển thị | Quyền hạn test |
|---|---|---|---|---|
| `admin` | `Admin@123` | `Admin` | Quản trị hệ thống | Toàn quyền (Tính lương, Xóa nhân viên) |
| `hr01` | `Hr@123` | `HR` | Nguyễn Thị Mai | Quản trị HR, tạo task Kanoan, duyệt nghỉ phép |
| `nv001` | `Nv@123` | `NhanVien` | Vũ Đình Trọng | Kéo task của mình, check-in, xin nghỉ phép, xem lương |