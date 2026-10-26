-- ============================================================================
-- SEED DATA CHO CSDL QUANLYNHANSU
-- Chay SAU khi da chay QUANLYNHANSU.sql (tao cau truc)
-- File nay nap du lieu mau: 5 phong ban, 6 chuc vu, 35 nhan vien,
-- tai khoan, hop dong, cham cong, bang luong, nghi phep, kanban, binh luan.
-- KHONG seed du lieu mau, chi la file demo rieng biet.
-- ============================================================================

USE QUANLYNHANSU;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'====================================================================';
PRINT N'BAT DAU NAP DU LIEU MAU (SEED DATA)...';
PRINT N'====================================================================';
GO

-- ============================================================================
-- 1. PHONG BAN (5 phong)
-- ============================================================================
MERGE INTO dbo.PhongBan AS target
USING (VALUES
    ('PB001', N'Phòng Công nghệ Thông tin', N'Phát triển và vận hành hệ thống phần mềm', '2020-01-15', NULL),
    ('PB002', N'Phòng Nhân sự', N'Tuyển dụng, đào tạo và quản lý nhân tài', '2020-01-15', NULL),
    ('PB003', N'Phòng Kế toán - Tài chính', N'Quản lý ngân sách, hóa đơn và tính lương', '2020-01-15', NULL),
    ('PB004', N'Phòng Kinh doanh', N'Tìm kiếm khách hàng và phát triển thị trường', '2021-03-01', NULL),
    ('PB005', N'Phòng Marketing', N'Quảng bá thương hiệu và truyền thông', '2021-06-15', NULL)
) AS source (MaPB, TenPB, MoTa, NgayThanhLap, MaNV_QL)
ON target.MaPB = source.MaPB
WHEN NOT MATCHED THEN
    INSERT (MaPB, TenPB, MoTa, NgayThanhLap, MaNV_QL)
    VALUES (source.MaPB, source.TenPB, source.MoTa, source.NgayThanhLap, source.MaNV_QL);
GO

-- ============================================================================
-- 2. CHUC VU (6 chuc vu)
-- ============================================================================
MERGE INTO dbo.ChucVu AS target
USING (VALUES
    ('CV001', N'Giám đốc điều hành', 40000000.00, N'Lãnh đạo toàn diện công ty'),
    ('CV002', N'Trưởng phòng', 25000000.00, N'Quản lý chuyên môn phòng ban'),
    ('CV003', N'Chuyên viên chính', 18000000.00, N'Nhân viên có kinh nghiệm thâm niên'),
    ('CV004', N'Nhân viên', 12000000.00, N'Thực hiện các công việc chuyên trách'),
    ('CV005', N'Thực tập sinh', 4000000.00, N'Học việc và hỗ trợ dự án'),
    ('CV006', N'Chuyên viên Nhân sự', 15000000.00, N'Phụ trách chấm công, tuyển dụng và tính lương')
) AS source (MaCV, TenCV, LuongCoBan, MoTa)
ON target.MaCV = source.MaCV
WHEN NOT MATCHED THEN
    INSERT (MaCV, TenCV, LuongCoBan, MoTa)
    VALUES (source.MaCV, source.TenCV, source.LuongCoBan, source.MoTa);
GO

-- ============================================================================
-- 3. NHAN VIEN (35 nguoi: NV000 - NV034)
-- ============================================================================
MERGE INTO dbo.NhanVien AS target
USING (VALUES
    ('NV000', N'Quản trị hệ thống', N'Nam', '1990-01-01', '001090000000', '0900000000', 'admin@hrm.local', N'Hà Nội', 'PB001', 'CV001', '2020-01-01', N'Đang làm'),
    ('NV001', N'Trần Quang Huy', N'Nam', '1985-05-12', '001085012345', '0912345678', 'huy.tq@company.com', N'Hà Nội', 'PB001', 'CV002', '2020-02-01', N'Đang làm'),
    ('NV002', N'Nguyễn Thị Mai', N'Nữ', '1990-08-20', '001090023456', '0923456789', 'mai.nt@company.com', N'Hà Nội', 'PB002', 'CV002', '2020-02-15', N'Đang làm'),
    ('NV003', N'Lê Hoàng Long', N'Nam', '1988-11-05', '001088034567', '0934567890', 'long.lh@company.com', N'Bắc Ninh', 'PB003', 'CV002', '2020-03-01', N'Đang làm'),
    ('NV004', N'Phạm Thu Trang', N'Nữ', '1992-04-18', '001092045678', '0945678901', 'trang.pt@company.com', N'Hưng Yên', 'PB004', 'CV002', '2021-03-10', N'Đang làm'),
    ('NV005', N'Đặng Quốc Bảo', N'Nam', '1991-09-25', '001091056789', '0956789012', 'bao.dq@company.com', N'Hải Phòng', 'PB005', 'CV002', '2021-06-20', N'Đang làm'),
    ('NV006', N'Vũ Đình Trọng', N'Nam', '1995-02-14', '001095067890', '0967890123', 'trong.vd@company.com', N'Hà Nội', 'PB001', 'CV003', '2021-01-10', N'Đang làm'),
    ('NV007', N'Bùi Thanh Thảo', N'Nữ', '1996-07-22', '001096078901', '0978901234', 'thao.bt@company.com', N'Hà Nam', 'PB001', 'CV004', '2021-05-15', N'Đang làm'),
    ('NV008', N'Hoàng Minh Tuấn', N'Nam', '1998-10-30', '001098089012', '0989012345', 'tuan.hm@company.com', N'Vĩnh Phúc', 'PB001', 'CV004', '2022-03-01', N'Đang làm'),
    ('NV009', N'Đỗ Phương Linh', N'Nữ', '1999-12-05', '001099090123', '0990123456', 'linh.dp@company.com', N'Hà Nội', 'PB001', 'CV005', '2023-08-01', N'Đang làm'),
    ('NV010', N'Ngô Văn Kiên', N'Nam', '1994-03-17', '001094001234', '0901234567', 'kien.nv@company.com', N'Nam Định', 'PB002', 'CV006', '2021-04-01', N'Đang làm'),
    ('NV011', N'Dương Thúy Hằng', N'Nữ', '1997-06-09', '001097012345', '0912345670', 'hang.dt@company.com', N'Thái Bình', 'PB002', 'CV004', '2022-02-15', N'Đang làm'),
    ('NV012', N'Lý Hải Yến', N'Nữ', '1993-01-28', '001093023456', '0923456781', 'yen.lh@company.com', N'Hải Dương', 'PB003', 'CV003', '2020-07-01', N'Đang làm'),
    ('NV013', N'Chu Đức Minh', N'Nam', '1996-09-11', '001096034567', '0934567892', 'minh.cd@company.com', N'Hà Nội', 'PB003', 'CV004', '2021-09-01', N'Đang làm'),
    ('NV014', N'Mai Xuân Phúc', N'Nam', '1995-11-23', '001095045678', '0945678903', 'phuc.mx@company.com', N'Quảng Ninh', 'PB004', 'CV003', '2021-08-15', N'Đang làm'),
    ('NV015', N'Lê Ngọc Ánh', N'Nữ', '1998-05-19', '001098056789', '0956789014', 'anh.ln@company.com', N'Bắc Giang', 'PB004', 'CV004', '2022-06-01', N'Đang làm'),
    ('NV016', N'Tạ Quang Đạt', N'Nam', '2000-04-02', '001200067890', '0967890125', 'dat.tq@company.com', N'Hà Nội', 'PB004', 'CV005', '2024-01-15', N'Đang làm'),
    ('NV017', N'Hà Bích Ngọc', N'Nữ', '1997-08-14', '001097078901', '0978901236', 'ngoc.hb@company.com', N'Phú Thọ', 'PB005', 'CV004', '2022-04-10', N'Đang làm'),
    ('NV018', N'Phan Đình Duy', N'Nam', '1999-03-27', '001099089012', '0989012347', 'duy.pd@company.com', N'Hòa Bình', 'PB005', 'CV004', '2023-03-01', N'Đang làm'),
    ('NV019', N'Đoàn Văn Hậu', N'Nam', '1993-10-12', '001093090123', '0990123458', 'hau.dv@company.com', N'Thái Bình', 'PB001', 'CV004', '2022-10-01', N'Tạm nghỉ'),
    ('NV020', N'Vương Bảo Trâm', N'Nữ', '1992-12-30', '001092001234', '0901234569', 'tram.vb@company.com', N'Hà Nội', 'PB002', 'CV004', '2021-11-01', N'Nghỉ việc'),
    ('NV021', N'Nguyễn Hoài Nam', N'Nam', '1994-07-08', '001094112233', '0911223344', 'nam.nh@company.com', N'Hà Nội', 'PB001', 'CV004', '2022-05-01', N'Đang làm'),
    ('NV022', N'Trịnh Thị Hồng', N'Nữ', '1996-02-19', '001096223344', '0922334455', 'hong.tt@company.com', N'Ninh Bình', 'PB002', 'CV004', '2022-08-15', N'Đang làm'),
    ('NV023', N'Bùi Văn Thành', N'Nam', '1990-11-11', '001090334455', '0933445566', 'thanh.bv@company.com', N'Thanh Hóa', 'PB003', 'CV003', '2021-02-01', N'Đang làm'),
    ('NV024', N'Lê Thùy Dương', N'Nữ', '1995-09-30', '001095445566', '0944556677', 'duong.lt@company.com', N'Hà Nội', 'PB003', 'CV004', '2022-11-01', N'Đang làm'),
    ('NV025', N'Phạm Quốc Cường', N'Nam', '1993-04-25', '001093556677', '0955667788', 'cuong.pq@company.com', N'Nam Định', 'PB004', 'CV003', '2021-07-01', N'Đang làm'),
    ('NV026', N'Hoàng Thị Lệ', N'Nữ', '1997-12-14', '001097667788', '0966778899', 'le.ht@company.com', N'Nghệ An', 'PB004', 'CV004', '2023-01-10', N'Đang làm'),
    ('NV027', N'Đinh Công Vinh', N'Nam', '1998-06-03', '001098778899', '0977889900', 'vinh.dc@company.com', N'Hà Tĩnh', 'PB004', 'CV005', '2024-03-01', N'Đang làm'),
    ('NV028', N'Vũ Thị Kim Oanh', N'Nữ', '1994-08-21', '001094889900', '0988990011', 'oanh.vk@company.com', N'Hà Nội', 'PB005', 'CV003', '2021-10-01', N'Đang làm'),
    ('NV029', N'Ngô Đức Thắng', N'Nam', '1996-01-16', '001096990011', '0999001122', 'thang.nd@company.com', N'Hải Phòng', 'PB005', 'CV004', '2022-09-01', N'Đang làm'),
    ('NV030', N'Trần Mỹ Hạnh', N'Nữ', '1999-05-28', '001099001122', '0900112233', 'hanh.tm@company.com', N'Cần Thơ', 'PB005', 'CV004', '2023-06-15', N'Đang làm'),
    ('NV031', N'Lương Văn Tú', N'Nam', '1992-03-09', '001092112233', '0911223345', 'tu.lv@company.com', N'Hà Nội', 'PB001', 'CV003', '2021-12-01', N'Đang làm'),
    ('NV032', N'Phan Thị Yến', N'Nữ', '1997-10-17', '001097223344', '0922334456', 'yen.pt2@company.com', N'Huế', 'PB002', 'CV006', '2022-07-01', N'Đang làm'),
    ('NV033', N'Đỗ Minh Quân', N'Nam', '1998-12-25', '001098334455', '0933445567', 'quan.dm@company.com', N'Đà Nẵng', 'PB001', 'CV005', '2024-06-01', N'Đang làm'),
    ('NV034', N'Bùi Thị Ngà', N'Nữ', '1995-06-11', '001095445567', '0944556678', 'nga.bt@company.com', N'Hà Nam', 'PB003', 'CV004', '2022-12-01', N'Đang làm')
) AS source (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
ON target.MaNV = source.MaNV
WHEN NOT MATCHED THEN
    INSERT (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
    VALUES (source.MaNV, source.HoTen, source.GioiTinh, source.NgaySinh, source.CCCD, source.SDT, source.Email, source.DiaChi, source.MaPB, source.MaCV, source.NgayVaoLam, source.TrangThai);
GO

-- Cap nhat truong phong
UPDATE dbo.PhongBan SET MaNV_QL = 'NV001' WHERE MaPB = 'PB001';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV002' WHERE MaPB = 'PB002';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV003' WHERE MaPB = 'PB003';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV004' WHERE MaPB = 'PB004';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV005' WHERE MaPB = 'PB005';
GO

-- ============================================================================
-- 4. TAI KHOAN (Admin, HR, NhanVien)
-- Mat khau demo: admin/Admin@123, hr01/Hr@123, nv001/Nv@123
-- ============================================================================
MERGE INTO dbo.TaiKhoan AS target
USING (VALUES
    ('admin', '$2a$11$25EBmDhZ2KvKtoeLaNdZpePVlZX.0214oTWBnBhdGBl.l0y59dDGS', N'Admin',    'NV000', 1),
    ('hr01',  '$2a$11$ZbOXYsdJoZSC/.7xlxTNDef02SgNrBjS0lAozqVIcGCD9Ste8Cn/S', N'HR',       'NV002', 1),
    ('hr02',  '$2a$11$5p51Wi1CqP0XuoeS1dCRueIcJGVQhjdRLmo3NjiB90YefMO.FwO3m', N'HR',       'NV010', 1),
    ('nv001', '$2a$11$fCjjPd0/hu4XYOjdSAdI5Os9Fn/UZXD3S4izg7Xd8WpCnQjM2b7Ra', N'NhanVien', 'NV006', 1),
    ('nv002', '$2a$11$WsMbIuPJvOmvLDQUhVyQeeno9wI84Ne0OaZkP5IU3KY8teb.UZU6G', N'NhanVien', 'NV007', 1),
    ('nv003', '$2a$11$fCjjPd0/hu4XYOjdSAdI5Os9Fn/UZXD3S4izg7Xd8WpCnQjM2b7Ra', N'NhanVien', 'NV008', 1)
) AS source (TenDangNhap, MatKhauHash, VaiTro, MaNV, TrangThai)
ON target.TenDangNhap = source.TenDangNhap
WHEN MATCHED THEN
    UPDATE SET target.MatKhauHash = source.MatKhauHash, target.MaNV = source.MaNV, target.VaiTro = source.VaiTro
WHEN NOT MATCHED THEN
    INSERT (TenDangNhap, MatKhauHash, VaiTro, MaNV, TrangThai)
    VALUES (source.TenDangNhap, source.MatKhauHash, source.VaiTro, source.MaNV, source.TrangThai);
GO

-- ============================================================================
-- 5. HOP DONG
-- ============================================================================
MERGE INTO dbo.HopDong AS target
USING (VALUES
    ('HD0001', 'NV001', N'Chính thức', '2020-02-01', '2027-02-01', 25000000.00, N'Hiệu lực'),
    ('HD0002', 'NV002', N'Chính thức', '2020-02-15', '2027-02-15', 25000000.00, N'Hiệu lực'),
    ('HD0003', 'NV003', N'Chính thức', '2020-03-01', '2027-03-01', 25000000.00, N'Hiệu lực'),
    ('HD0004', 'NV004', N'Chính thức', '2021-03-10', '2027-03-10', 25000000.00, N'Hiệu lực'),
    ('HD0005', 'NV005', N'Chính thức', '2021-06-20', '2027-06-20', 25000000.00, N'Hiệu lực'),
    ('HD0006', 'NV006', N'Chính thức', '2021-01-10', '2027-01-10', 18000000.00, N'Hiệu lực'),
    ('HD0007', 'NV007', N'Chính thức', '2021-05-15', '2027-05-15', 12000000.00, N'Hiệu lực'),
    ('HD0008', 'NV008', N'Chính thức', '2022-03-01', '2027-03-01', 12000000.00, N'Hiệu lực'),
    ('HD0009', 'NV009', N'Thử việc',   '2023-08-01', '2024-02-01', 4000000.00,  N'Hiệu lực'),
    ('HD0010', 'NV010', N'Chính thức', '2021-04-01', '2027-04-01', 15000000.00, N'Hiệu lực'),
    ('HD0011', 'NV011', N'Chính thức', '2022-02-15', '2027-02-15', 12000000.00, N'Hiệu lực'),
    ('HD0012', 'NV012', N'Chính thức', '2020-07-01', '2027-07-01', 18000000.00, N'Hiệu lực'),
    ('HD0013', 'NV014', N'Chính thức', '2021-08-15', '2027-08-15', 18000000.00, N'Hiệu lực'),
    ('HD0014', 'NV020', N'Chính thức', '2021-11-01', '2023-11-01', 12000000.00, N'Hết hạn'),
    ('HD0015', 'NV021', N'Chính thức', '2022-05-01', '2027-05-01', 12000000.00, N'Hiệu lực'),
    ('HD0016', 'NV022', N'Chính thức', '2022-08-15', '2027-08-15', 12000000.00, N'Hiệu lực'),
    ('HD0017', 'NV023', N'Chính thức', '2021-02-01', '2027-02-01', 18000000.00, N'Hiệu lực'),
    ('HD0018', 'NV025', N'Chính thức', '2021-07-01', '2027-07-01', 18000000.00, N'Hiệu lực'),
    ('HD0019', 'NV027', N'Thời vụ',    '2024-03-01', '2024-12-31', 4000000.00,  N'Hiệu lực'),
    ('HD0020', 'NV028', N'Chính thức', '2021-10-01', '2027-10-01', 18000000.00, N'Hiệu lực')
) AS source (MaHD, MaNV, LoaiHD, NgayBatDau, NgayKetThuc, LuongThoaThuan, TrangThai)
ON target.MaHD = source.MaHD
WHEN NOT MATCHED THEN
    INSERT (MaHD, MaNV, LoaiHD, NgayBatDau, NgayKetThuc, LuongThoaThuan, TrangThai)
    VALUES (source.MaHD, source.MaNV, source.LoaiHD, source.NgayBatDau, source.NgayKetThuc, source.LuongThoaThuan, source.TrangThai);
GO

-- ============================================================================
-- 6. CHAM CONG (thang 10/2026, ngay 1-25, bo T7/CN)
-- ============================================================================
DECLARE @Day INT = 1;
WHILE @Day <= 25
BEGIN
    DECLARE @CurDate DATE = DATEFROMPARTS(2026, 10, @Day);
    IF DATENAME(WEEKDAY, @CurDate) NOT IN (N'Saturday', N'Sunday')
    BEGIN
        INSERT INTO dbo.ChamCong (MaNV, Ngay, GioVao, GioRa, TrangThai)
        SELECT
            nv.MaNV,
            @CurDate,
            '08:00:00',
            '17:30:00',
            CASE
                WHEN nv.MaNV = 'NV007' AND @Day = 5 THEN N'Trễ'
                WHEN nv.MaNV = 'NV008' AND @Day = 12 THEN N'Vắng'
                WHEN nv.MaNV = 'NV013' AND @Day = 8 THEN N'Trễ'
                ELSE N'Đủ công'
            END
        FROM dbo.NhanVien nv
        WHERE nv.TrangThai = N'Đang làm'
        AND NOT EXISTS (SELECT 1 FROM dbo.ChamCong WHERE MaNV = nv.MaNV AND Ngay = @CurDate);
    END
    SET @Day = @Day + 1;
END;
GO

-- ============================================================================
-- 7. NGHI PHEP
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.NghiPhep)
BEGIN
    INSERT INTO dbo.NghiPhep (MaNV, LoaiPhep, TuNgay, DenNgay, LyDo, TrangThai, MaNV_Duyet, NgayDuyet)
    VALUES
    ('NV006', N'Phép năm', '2026-10-15', '2026-10-16', N'Gia đình có việc hiếu hỉ', N'Đã duyệt', 'NV002', '2026-10-14 09:30:00'),
    ('NV007', N'Bệnh', '2026-10-20', '2026-10-21', N'Sốt cấp tính có giấy khám bác sĩ', N'Đã duyệt', 'NV002', '2026-10-19 14:00:00'),
    ('NV008', N'Phép năm', '2026-10-25', '2026-10-26', N'Nghỉ ngơi cùng người thân', N'Chờ duyệt', NULL, NULL),
    ('NV011', N'Không lương', '2026-10-05', '2026-10-07', N'Việc cá nhân đột xuất', N'Từ chối', 'NV002', '2026-10-04 16:20:00'),
    ('NV012', N'Phép năm', '2026-11-02', '2026-11-04', N'Du lịch gia đình', N'Chờ duyệt', NULL, NULL),
    ('NV021', N'Bệnh', '2026-10-22', '2026-10-23', N'Khám sức khỏe định kỳ', N'Đã duyệt', 'NV002', '2026-10-21 10:00:00'),
    ('NV025', N'Phép năm', '2026-10-28', '2026-10-29', N'Việc riêng', N'Chờ duyệt', NULL, NULL);
END
GO

-- ============================================================================
-- 8. TINH LUONG THANG 10/2026 (goi SP)
-- ============================================================================
EXEC dbo.SP_TinhLuongThang @Thang = 10, @Nam = 2026;
GO

-- ============================================================================
-- 9. CHI PHI PHAT SINH (thuong/phat/ung luong)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.ChiPhiPhatSinh)
BEGIN
    INSERT INTO dbo.ChiPhiPhatSinh (MaNV, Loai, SoTien, LyDo, Thang, Nam)
    VALUES
    ('NV006', N'Thưởng', 2000000.00, N'Thưởng hoàn thành dự án xuất sắc', 10, 2026),
    ('NV006', N'Công tác phí', 500000.00, N'Công tác Hà Nội - Hải Phòng', 10, 2026),
    ('NV006', N'Phạt', 50000.00, N'Đi trễ 1 lần', 10, 2026),
    ('NV007', N'Ứng lương', 3000000.00, N'Ứng lương đầu tháng', 10, 2026),
    ('NV012', N'Thưởng', 1500000.00, N'Thưởng KPI quý 3', 10, 2026),
    ('NV021', N'Phạt', 100000.00, N'Vi phạm nội quy', 10, 2026);
END
GO

-- ============================================================================
-- 10. CONG VIEC KANBAN (20 task trai deu 4 cot)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.CongViec)
BEGIN
    INSERT INTO dbo.CongViec (TieuDe, MoTa, MaNV_PhuTrach, MaNV_Giao, TrangThai, ViTri, DoUuTien, NgayBatDau, Deadline, NgayHoanThanh)
    VALUES
    -- COT TODO
    (N'Nghiên cứu kiến trúc Microservices', N'Đánh giá khả năng mở rộng hệ thống cho quý 1 năm sau', 'NV006', 'NV001', N'Todo', 1000, N'Cao', '2026-10-24', '2026-11-05', NULL),
    (N'Chuẩn bị hồ sơ tuyển dụng đợt tháng 11', N'Lên JD cho 3 vị trí Frontend Developer và 2 Tester', 'NV010', 'NV002', N'Todo', 2000, N'Trung bình', '2026-10-25', '2026-11-01', NULL),
    (N'Kiểm kê tài sản thiết bị văn phòng', N'Rà soát laptop, máy in và trang thiết bị các tầng', 'NV011', 'NV002', N'Todo', 3000, N'Thấp', '2026-10-26', '2026-11-10', NULL),
    (N'Lập báo cáo tài chính dự trù quý 4', N'Tổng hợp doanh thu và chi phí lương các phòng ban', 'NV012', 'NV003', N'Todo', 4000, N'Khẩn cấp', '2026-10-20', '2026-10-31', NULL),
    (N'Xây dựng chiến dịch quảng cáo TikTok', N'Thiết kế chuỗi video ngắn quảng bá văn hóa doanh nghiệp', 'NV017', 'NV005', N'Todo', 5000, N'Trung bình', '2026-10-24', '2026-11-15', NULL),
    (N'Rà soát bảo mật hệ thống định kỳ', N'Kiểm tra lỗ hổng OWASP và cập nhật patch bảo mật', 'NV021', 'NV001', N'Todo', 6000, N'Cao', '2026-10-27', '2026-11-08', NULL),
    -- COT INPROGRESS
    (N'Thiết kế CSDL SQL Server và viết Stored Procedures', N'Thiết kế 11 bảng chuẩn 3NF và viết SP di chuyển task gap-based', 'NV006', 'NV001', N'InProgress', 1000, N'Khẩn cấp', '2026-10-15', '2026-10-23', NULL),
    (N'Gặp gỡ khách hàng ký hợp đồng phần mềm ERP', N'Thương thảo điều khoản bảo hành và thanh toán theo mốc dự án', 'NV014', 'NV004', N'InProgress', 2000, N'Khẩn cấp', '2026-10-22', '2026-10-26', NULL),
    (N'Phát triển module chấm công GPS', N'Tích hợp định vị GPS vào API check-in cho nhân viên di động', 'NV008', 'NV001', N'InProgress', 3000, N'Cao', '2026-10-18', '2026-10-30', NULL),
    (N'Tối ưu hiệu năng truy vấn báo cáo lương', N'Thêm index và viết lại các SP tính lương chậm', 'NV023', 'NV003', N'InProgress', 4000, N'Trung bình', '2026-10-21', '2026-11-04', NULL),
    -- COT REVIEW
    (N'Phát triển API Xác thực JWT và phân quyền RBAC', N'Viết AuthController, PasswordHasher với BCrypt và JwtHelper', 'NV007', 'NV001', N'Review', 1000, N'Cao', '2026-10-18', '2026-10-28', NULL),
    (N'Xây dựng giao diện Kanban kéo thả', N'Hoàn thiện 4 cột, Drawer xem chi tiết và modal tạo task', 'NV008', 'NV001', N'Review', 2000, N'Cao', '2026-10-20', '2026-10-30', NULL),
    (N'Thiết kế UI/UX trang Dashboard quản trị', N'Bento grid, KPI cards và biểu đồ xu hướng công việc', 'NV031', 'NV001', N'Review', 3000, N'Cao', '2026-10-19', '2026-10-29', NULL),
    -- COT DONE
    (N'Họp khởi động dự án HRM và chốt phạm vi BTL', N'Thống nhất dùng .NET 8, React 19 và SQL Server', 'NV006', 'NV001', N'Done', 1000, N'Khẩn cấp', '2026-10-01', '2026-10-05', '2026-10-04 17:00:00'),
    (N'Khảo sát yêu cầu bài toán quản lý nhân sự', N'Thu thập biểu mẫu chấm công, thang bảng lương và hợp đồng', 'NV007', 'NV002', N'Done', 2000, N'Cao', '2026-10-05', '2026-10-10', '2026-10-09 15:30:00'),
    (N'Cài đặt môi trường phát triển & Repository GitHub', N'Tạo repo git, mời các thành viên và cấu hình branch protection', 'NV008', 'NV001', N'Done', 3000, N'Trung bình', '2026-10-08', '2026-10-12', '2026-10-11 11:20:00'),
    (N'Duyệt kế hoạch ngân sách quý 3', N'Đã hoàn tất thanh quyết toán các khoản chi tiêu phòng ban', 'NV013', 'NV003', N'Done', 4000, N'Trung bình', '2026-10-01', '2026-10-10', '2026-10-08 09:45:00'),
    (N'Viết tài liệu API Contract cho Frontend', N'Đặc tả OpenAPI 3.0 và bảng mã lỗi chuẩn', 'NV021', 'NV001', N'Done', 5000, N'Trung bình', '2026-10-06', '2026-10-13', '2026-10-12 14:00:00'),
    (N'Tổ chức buổi đào tạo nội bộ về Git Flow', N'Hướng dẫn quy trình branch, PR và review code cho team', 'NV032', 'NV002', N'Done', 6000, N'Thấp', '2026-10-07', '2026-10-14', '2026-10-13 16:30:00');
END
GO

-- ============================================================================
-- 11. BINH LUAN TASK
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.BinhLuan)
BEGIN
    INSERT INTO dbo.BinhLuan (MaTask, MaNV, NoiDung, ThoiGian)
    VALUES
    (7, 'NV001', N'Task này sắp hết hạn rồi, Huy xem đẩy nhanh tiến độ nhé!', DATEADD(HOUR, -5, GETDATE())),
    (7, 'NV006', N'Em đang viết Stored Procedure SP_DiChuyenTask, tối nay sẽ test xong anh nhé.', DATEADD(HOUR, -3, GETDATE())),
    (11, 'NV001', N'Nhớ dùng BCrypt.Net-Next để hash mật khẩu an toàn.', DATEADD(HOUR, -8, GETDATE())),
    (12, 'NV007', N'Đã ghép xong phần kéo thả với Optimistic UI, rất mượt!', DATEADD(HOUR, -2, GETDATE())),
    (13, 'NV031', N'Dashboard đã responsive mobile, nhưng cần test thêm trên tablet.', DATEADD(HOUR, -6, GETDATE())),
    (9, 'NV008', N'Module GPS cần thêm quyền truy cập vị trí trên trình duyệt.', DATEADD(HOUR, -1, GETDATE()));
END
GO

PRINT N'====================================================================';
PRINT N'===> NAP DU LIEU MAU HOAN TAT! <===';
PRINT N'===> 5 phong ban, 6 chuc vu, 35 nhan vien, 6 tai khoan, 20 hop dong <===';
PRINT N'===> Tai khoan demo: admin/Admin@123, hr01/Hr@123, nv001/Nv@123 <===';
PRINT N'====================================================================';
GO
