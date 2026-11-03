-- ============================================================================
-- SEED DATA CHO CSDL QUANLYNHANSU  (ban mo rong - 100 ID moi bang)
-- Chay SAU khi da chay QUANLYNHANSU.sql (tao cau truc).
--
-- File nay WIPE du lieu cu trong cac bang nghiep vu roi nap lai:
--   10 phong ban, 8 chuc vu, 100 nhan vien (NV000-NV099), tai khoan,
--   100 hop dong, 2 thang cham cong, 100 nghi phep, 100 chi phi phat sinh,
--   100 cong viec Kanban, 100 binh luan.
--
-- Thu tu nap rat quan trong:
--   1..7 nap du lieu goc  ->  8 cham cong  ->  9 tinh luong (SP)  ->  10 tro di
--   Nghi phep phai INSERT 'Cho duyet' roi UPDATE sang 'Da duyet' de trigger
--   TR_NghiPhep_Update dong bo vao ChamCong.
-- ============================================================================

USE QUANLYNHANSU;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET XACT_ABORT ON;
GO

PRINT N'====================================================================';
PRINT N'BAT DAU WIPE + NAP DU LIEU MAU (SEED DATA)...';
PRINT N'====================================================================';
GO

-- ============================================================================
-- 0. WIPE DU LIEU CU (thu tu xoa nguoc khoa ngoai)
-- ============================================================================
DELETE FROM dbo.BinhLuan;
DELETE FROM dbo.CongViec;
DELETE FROM dbo.ChiPhiPhatSinh;
DELETE FROM dbo.BangLuong;
DELETE FROM dbo.NghiPhep;
DELETE FROM dbo.ChamCong;
DELETE FROM dbo.HopDong;
DELETE FROM dbo.TaiKhoan;
-- Go FK PhongBan.MaNV_QL truoc khi xoa NhanVien de tranh vong khoa ngoai
UPDATE dbo.PhongBan SET MaNV_QL = NULL;
DELETE FROM dbo.NhanVien;
DELETE FROM dbo.PhongBan;
DELETE FROM dbo.ChucVu;
GO

-- ============================================================================
-- 1. PHONG BAN (10 phong)
-- ============================================================================
INSERT INTO dbo.PhongBan (MaPB, TenPB, MoTa, NgayThanhLap, MaNV_QL)
VALUES
    ('PB001', N'Phòng Công nghệ Thông tin', N'Phát triển và vận hành hệ thống phần mềm', '2020-01-15', NULL),
    ('PB002', N'Phòng Nhân sự', N'Tuyển dụng, đào tạo và quản lý nhân tài', '2020-01-15', NULL),
    ('PB003', N'Phòng Kế toán - Tài chính', N'Quản lý ngân sách, hóa đơn và tính lương', '2020-01-15', NULL),
    ('PB004', N'Phòng Kinh doanh', N'Tìm kiếm khách hàng và phát triển thị trường', '2021-03-01', NULL),
    ('PB005', N'Phòng Marketing', N'Quảng bá thương hiệu và truyền thông', '2021-06-15', NULL),
    ('PB006', N'Phòng Hành chính', N'Quản trị văn phòng, tài sản và lễ tân', '2021-09-01', NULL),
    ('PB007', N'Phòng Chăm sóc Khách hàng', N'Tiếp nhận, xử lý và hỗ trợ khách hàng', '2022-01-10', NULL),
    ('PB008', N'Phòng Nghiên cứu & Phát triển', N'Nghiên cứu công nghệ mới và cải tiến sản phẩm', '2022-05-01', NULL),
    ('PB009', N'Phòng Pháp chế', N'Soát xét hợp đồng và tuân thủ pháp lý', '2023-02-01', NULL),
    ('PB010', N'Phòng Vận hành', N'Điều phối vận hành và logistics nội bộ', '2023-07-01', NULL);
GO

-- ============================================================================
-- 2. CHUC VU (8 chuc vu)
-- ============================================================================
INSERT INTO dbo.ChucVu (MaCV, TenCV, LuongCoBan, MoTa)
VALUES
    ('CV001', N'Giám đốc điều hành', 40000000.00, N'Lãnh đạo toàn diện công ty'),
    ('CV002', N'Trưởng phòng', 25000000.00, N'Quản lý chuyên môn phòng ban'),
    ('CV003', N'Phó phòng', 20000000.00, N'Hỗ trợ trưởng phòng và thay thế khi vắng'),
    ('CV004', N'Chuyên viên chính', 18000000.00, N'Nhân viên có kinh nghiệm thâm niên'),
    ('CV005', N'Nhân viên', 12000000.00, N'Thực hiện các công việc chuyên trách'),
    ('CV006', N'Chuyên viên Nhân sự', 15000000.00, N'Phụ trách chấm công, tuyển dụng và tính lương'),
    ('CV007', N'Kế toán viên', 14000000.00, N'Hạch toán, đối soát và lập báo cáo tài chính'),
    ('CV008', N'Thực tập sinh', 4000000.00, N'Học việc và hỗ trợ dự án');
GO

-- ============================================================================
-- 3. NHAN VIEN (100 nguoi: NV000 - NV099)
--    Sinh tu dong tu 2 danh sach ten de du ten/gioi tinh/ngay sinh/que quan.
-- ============================================================================
DECLARE @Ho TABLE (So INT, Ho NVARCHAR(20));
INSERT INTO @Ho (So, Ho) VALUES (0, N'Nguyễn'), (1, N'Trần'), (2, N'Lê'), (3, N'Phạm'), (4, N'Hoàng'),
    (5, N'Phan'), (6, N'Vũ'), (7, N'Đặng'), (8, N'Bùi'), (9, N'Đỗ'), (10, N'Hồ'), (11, N'Ngô'),
    (12, N'Dương'), (13, N'Lý'), (14, N'Trịnh'), (15, N'Đinh'), (16, N'Tạ'), (17, N'Lương'), (18, N'Mai'), (19, N'Chu');

DECLARE @Ten TABLE (So INT, Ten NVARCHAR(20), GioiTinh NVARCHAR(10));
INSERT INTO @Ten (So, Ten, GioiTinh) VALUES
    (0, N'Văn An', N'Nam'), (1, N'Thị Bình', N'Nữ'), (2, N'Minh Châu', N'Nữ'), (3, N'Quốc Cường', N'Nam'),
    (4, N'Thùy Dương', N'Nữ'), (5, N'Quang Đạt', N'Nam'), (6, N'Thị Hà', N'Nữ'), (7, N'Văn Hải', N'Nam'),
    (8, N'Mỹ Hạnh', N'Nữ'), (9, N'Đức Hậu', N'Nam'), (10, N'Hoàng Huy', N'Nam'), (11, N'Thị Hồng', N'Nữ'),
    (12, N'Văn Khánh', N'Nam'), (13, N'Xuân Lan', N'Nữ'), (14, N'Thị Lệ', N'Nữ'), (15, N'Hoàng Long', N'Nam'),
    (16, N'Thị Mai', N'Nữ'), (17, N'Đức Minh', N'Nam'), (18, N'Thị Ngọc', N'Nữ'), (19, N'Hữu Phúc', N'Nam'),
    (20, N'Thị Quỳnh', N'Nữ'), (21, N'Minh Quân', N'Nam'), (22, N'Thanh Sơn', N'Nam'), (23, N'Văn Thắng', N'Nam'),
    (24, N'Thanh Thảo', N'Nữ'), (25, N'Đình Trọng', N'Nam'), (26, N'Thu Trang', N'Nữ'), (27, N'Anh Tuấn', N'Nam'),
    (28, N'Văn Tú', N'Nam'), (29, N'Thị Vân', N'Nữ'), (30, N'Đình Vinh', N'Nam'), (31, N'Hải Yến', N'Nữ'),
    (32, N'Thị Yên', N'Nữ'), (33, N'Hoài Nam', N'Nam'), (34, N'Thị Ánh', N'Nữ'), (35, N'Văn Bảo', N'Nam');

DECLARE @DiaChi TABLE (So INT, Dia NVARCHAR(50));
INSERT INTO @DiaChi (So, Dia) VALUES (0, N'Hà Nội'), (1, N'Bắc Ninh'), (2, N'Hưng Yên'), (3, N'Hải Phòng'),
    (4, N'Hà Nam'), (5, N'Vĩnh Phúc'), (6, N'Nam Định'), (7, N'Thái Bình'), (8, N'Hải Dương'),
    (9, N'Quảng Ninh'), (10, N'Bắc Giang'), (11, N'Phú Thọ'), (12, N'Hòa Bình'), (13, N'Ninh Bình'),
    (14, N'Thanh Hóa'), (15, N'Nghệ An'), (16, N'Hà Tĩnh'), (17, N'Cần Thơ'), (18, N'Huế'), (19, N'Đà Nẵng');

DECLARE @i INT = 0;
DECLARE @ma NVARCHAR(5), @sHo NVARCHAR(20), @sTen NVARCHAR(20), @gt NVARCHAR(10);
WHILE @i < 100
BEGIN
    SET @ma = 'NV' + RIGHT('000' + CAST(@i AS NVARCHAR(3)), 3);
    -- NV000 la tai khoan admin he thong
    SET @sHo = (SELECT Ho FROM @Ho WHERE So = (@i * 7 + 3) % 20);
    SELECT @sTen = Ten, @gt = GioiTinh FROM @Ten WHERE So = (@i * 11 + 5) % 36;

    IF @i = 0
    BEGIN
        SET @sHo = N'Quản trị'; SET @sTen = N'hệ thống'; SET @gt = N'Nam';
    END

    INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
    VALUES (
        @ma,
        @sHo + N' ' + @sTen,
        @gt,
        -- Ngay sinh trai deu trong khoang 1980..1991 (4200 ngay)
        DATEADD(DAY, (@i * 137 + 30) % 4200, CAST('1980-01-01' AS DATE)),
        -- CCCD 12 so duy nhat
        RIGHT('000000000000' + CAST(100000000000 + @i * 731 + 12345 AS VARCHAR(12)), 12),
        '09' + RIGHT('00000000' + CAST(10000000 + @i * 3571 AS VARCHAR(8)), 8),
        'nv' + RIGHT('000' + CAST(@i AS NVARCHAR(3)), 3) + '@company.com',
        (SELECT Dia FROM @DiaChi WHERE So = (@i * 3 + 1) % 20),
        'PB' + RIGHT('000' + CAST((@i % 10) + 1 AS NVARCHAR(3)), 3),
        CASE
            WHEN @i = 0 THEN 'CV001'
            WHEN @i % 10 = 1 THEN 'CV002'
            WHEN @i % 10 = 2 THEN 'CV003'
            WHEN @i % 10 = 3 THEN 'CV004'
            WHEN @i % 10 IN (8, 9) THEN 'CV008'
            ELSE 'CV005'
        END,
        DATEADD(DAY, (@i * 23) % 1800, CAST('2020-01-01' AS DATE)),
        CASE
            WHEN @i % 17 = 0 AND @i > 0 THEN N'Nghỉ việc'
            WHEN @i % 13 = 0 AND @i > 0 THEN N'Tạm nghỉ'
            ELSE N'Đang làm'
        END
    );

    -- Vai tro HR / ke toan duoc gan chuc danh cho hop ly
    IF @i % 10 = 4 UPDATE dbo.NhanVien SET MaCV = 'CV006' WHERE MaNV = @ma;
    IF @i % 10 = 5 UPDATE dbo.NhanVien SET MaCV = 'CV007' WHERE MaNV = @ma;
    -- Truong phong cua cac phong PB004..PB010 duoc sinh o day, phai la NV dang lam
    IF @i IN (31, 41, 51, 61, 71, 81, 91) UPDATE dbo.NhanVien SET TrangThai = N'Đang làm' WHERE MaNV = @ma;

    SET @i = @i + 1;
END
GO

-- Gan truong phong quan ly cho 10 phong ban
UPDATE dbo.PhongBan SET MaNV_QL = 'NV001' WHERE MaPB = 'PB001';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV011' WHERE MaPB = 'PB002';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV021' WHERE MaPB = 'PB003';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV031' WHERE MaPB = 'PB004';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV041' WHERE MaPB = 'PB005';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV051' WHERE MaPB = 'PB006';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV061' WHERE MaPB = 'PB007';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV071' WHERE MaPB = 'PB008';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV081' WHERE MaPB = 'PB009';
UPDATE dbo.PhongBan SET MaNV_QL = 'NV091' WHERE MaPB = 'PB010';
GO

-- ============================================================================
-- 4. TAI KHOAN
-- Mat khau demo: admin/Admin@123, hr01/Hr@123, nv001/Nv@123
--   - admin  -> NV000 (Admin)
--   - hrXX   -> cac nhan vien chuc danh Chuyen vien Nhan su (HR)
--   - tpXX   -> cac truong phong (TruongPhong)
--   - nvXXX  -> 30 nhan vien dau tien (NhanVien)
-- ============================================================================
INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, MaNV, TrangThai)
SELECT 'admin', '$2a$11$25EBmDhZ2KvKtoeLaNdZpePVlZX.0214oTWBnBhdGBl.l0y59dDGS', N'Admin', 'NV000', 1
UNION ALL
-- HR: chuc danh Chuyen vien Nhan su
SELECT 'hr' + RIGHT('00' + CAST(ROW_NUMBER() OVER (ORDER BY MaNV) AS VARCHAR(2)), 2),
       '$2a$11$ZbOXYsdJoZSC/.7xlxTNDef02SgNrBjS0lAozqVIcGCD9Ste8Cn/S', N'HR', MaNV, 1
FROM dbo.NhanVien WHERE MaCV = 'CV006' AND TrangThai = N'Đang làm'
UNION ALL
-- Truong phong: DB CHECK chi cho phep Admin/HR/NhanVien (khong co TruongPhong),
-- nen cap vai tro HR - van quan ly duoc phong ban nho MaNV_QL + MaPB.
SELECT 'tp' + RIGHT('00' + CAST(ROW_NUMBER() OVER (ORDER BY MaNV) AS VARCHAR(2)), 2),
       '$2a$11$ZbOXYsdJoZSC/.7xlxTNDef02SgNrBjS0lAozqVIcGCD9Ste8Cn/S', N'HR', MaNV, 1
FROM dbo.NhanVien WHERE MaCV = 'CV002' AND TrangThai = N'Đang làm'
UNION ALL
-- Nhan vien: lay 30 nhan vien dang lam dau tien (bo NV000)
SELECT 'nv' + RIGHT('000' + CAST(ROW_NUMBER() OVER (ORDER BY MaNV) AS VARCHAR(3)), 3),
       '$2a$11$fCjjPd0/hu4XYOjdSAdI5Os9Fn/UZXD3S4izg7Xd8WpCnQjM2b7Ra', N'NhanVien', MaNV, 1
FROM (SELECT TOP 30 MaNV FROM dbo.NhanVien WHERE MaNV <> 'NV000' AND TrangThai = N'Đang làm' ORDER BY MaNV) t;

-- Tai khoan dang nhap dung nhu README (hr01/nv001/nv002...) tro toi nhan vien cu the
UPDATE dbo.TaiKhoan SET VaiTro = N'HR', MaNV = 'NV002' WHERE TenDangNhap = 'hr01';
UPDATE dbo.TaiKhoan SET VaiTro = N'NhanVien', MaNV = 'NV006' WHERE TenDangNhap = 'nv001';
UPDATE dbo.TaiKhoan SET VaiTro = N'NhanVien', MaNV = 'NV007' WHERE TenDangNhap = 'nv002';
GO

-- ============================================================================
-- 5. HOP DONG (100 hop dong - moi nhan vien 1 hop dong)
-- TR_HopDong_Update tu doi trang thai 'Het han' cho hop dong da qua ngay ket thuc.
-- ============================================================================
INSERT INTO dbo.HopDong (MaHD, MaNV, LoaiHD, NgayBatDau, NgayKetThuc, LuongThoaThuan, TrangThai)
SELECT
    'HD' + RIGHT('0000' + CAST(ROW_NUMBER() OVER (ORDER BY nv.MaNV) AS VARCHAR(4)), 4),
    nv.MaNV,
    CASE
        WHEN cv.MaCV = 'CV008' THEN N'Thử việc'
        WHEN nv.MaNV IN ('NV050', 'NV060', 'NV070') THEN N'Thời vụ'
        ELSE N'Chính thức'
    END,
    nv.NgayVaoLam,
    CASE
        WHEN cv.MaCV = 'CV008' THEN DATEADD(MONTH, 6, nv.NgayVaoLam)
        ELSE DATEADD(YEAR, 5, nv.NgayVaoLam)
    END,
    cv.LuongCoBan,
    N'Hiệu lực'
FROM dbo.NhanVien nv
JOIN dbo.ChucVu cv ON cv.MaCV = nv.MaCV;
GO

-- ============================================================================
-- 6. CHAM CONG (thang 9 & 10/2026; bo T7/CN; mot so nhan vien co Tre/Vang/Nghi phep)
--    '19000101' la Thu Hai => DATEDIFF(DAY,'19000101',d) % 7 = 5 -> T7, 6 -> CN
-- ============================================================================
DECLARE @Thang TABLE (Thang INT, SoNgay INT);
INSERT INTO @Thang (Thang, SoNgay) VALUES (9, 30), (10, 31);

DECLARE @t INT = 0, @ThangX INT, @Day INT, @MaxDay INT, @CurDate DATE;
WHILE @t < 2
BEGIN
    SET @ThangX = (SELECT Thang FROM @Thang ORDER BY Thang OFFSET @t ROWS FETCH NEXT 1 ROWS ONLY);
    SET @Day = 1;
    SET @MaxDay = (SELECT SoNgay FROM @Thang WHERE Thang = @ThangX);

    WHILE @Day <= @MaxDay
    BEGIN
        SET @CurDate = DATEFROMPARTS(2026, @ThangX, @Day);
        IF (DATEDIFF(DAY, '19000101', @CurDate) % 7) NOT IN (5, 6) -- bo T7/CN
        BEGIN
            INSERT INTO dbo.ChamCong (MaNV, Ngay, GioVao, GioRa, TrangThai)
            SELECT
                nv.MaNV,
                @CurDate,
                -- 10% di tre (vao 08:45), con lai 08:00
                CASE WHEN (CAST(RIGHT(nv.MaNV, 3) AS INT) + @Day + @ThangX * 31) % 10 = 0 THEN '08:45:00' ELSE '08:00:00' END,
                '17:30:00',
                CASE
                    WHEN (CAST(RIGHT(nv.MaNV, 3) AS INT) + @Day + @ThangX * 31) % 10 = 0 THEN N'Trễ'
                    WHEN (CAST(RIGHT(nv.MaNV, 3) AS INT) + @Day + @ThangX * 31) % 37 = 0 THEN N'Vắng'
                    ELSE N'Đủ công'
                END
            FROM dbo.NhanVien nv
            WHERE nv.TrangThai = N'Đang làm';
        END
        SET @Day = @Day + 1;
    END
    SET @t = @t + 1;
END
GO

-- ============================================================================
-- 7. NGHI PHEP (100 don, trai deu 4 trang thai)
--    INSERT 'Cho duyet' de dem MaNP on dinh, roi UPDATE sang 'Da duyet'
--    de trigger do ngay nghi vao bang cham cong.
-- ============================================================================
INSERT INTO dbo.NghiPhep (MaNV, LoaiPhep, TuNgay, DenNgay, LyDo, TrangThai, MaNV_Duyet, NgayDuyet)
SELECT
    nv.MaNV,
    CASE nv.rn % 4
        WHEN 0 THEN N'Phép năm'
        WHEN 1 THEN N'Bệnh'
        WHEN 2 THEN N'Không lương'
        ELSE N'Thai sản'
    END,
    nv.TuNgay,
    DATEADD(DAY, nv.rn % 3, nv.TuNgay),
    CASE nv.rn % 4
        WHEN 0 THEN N'Nghỉ ngơi, giải quyết việc gia đình'
        WHEN 1 THEN N'Ốm có giấy xác nhận của bác sĩ'
        WHEN 2 THEN N'Việc cá nhân đột xuất'
        ELSE N'Nghỉ thai sản theo chế độ'
    END,
    N'Chờ duyệt',
    NULL,
    NULL
FROM (
    SELECT
        n.MaNV,
        ROW_NUMBER() OVER (ORDER BY n.MaNV) AS rn,
        DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY n.MaNV) * 5) % 75, CAST('2026-09-01' AS DATE)) AS TuNgay
    FROM (SELECT TOP 100 MaNV FROM dbo.NhanVien ORDER BY MaNV) n
) nv;

-- Duyet / tu choi mot so don -> trigger TR_NghiPhep_Update dong bo vao ChamCong
UPDATE dbo.NghiPhep
SET TrangThai = N'Đã duyệt', MaNV_Duyet = 'NV002', NgayDuyet = DATEADD(DAY, -1, TuNgay)
WHERE MaNP % 10 IN (0, 1, 2, 3, 4, 5);

UPDATE dbo.NghiPhep
SET TrangThai = N'Từ chối', MaNV_Duyet = 'NV002', NgayDuyet = DATEADD(DAY, -1, TuNgay)
WHERE MaNP % 10 IN (6, 7);
GO

-- ============================================================================
-- 8. TINH LUONG (2 thang) - goi SP nen chay SAU khi co cham cong
-- ============================================================================
EXEC dbo.SP_TinhLuongThang @Thang = 9, @Nam = 2026;
EXEC dbo.SP_TinhLuongThang @Thang = 10, @Nam = 2026;
GO

-- ============================================================================
-- 9. CHI PHI PHAT SINH (100 dong: Thuong / Cong tac phi / Phat / Ung luong)
-- ============================================================================
INSERT INTO dbo.ChiPhiPhatSinh (MaNV, Loai, SoTien, LyDo, Thang, Nam, NgayTao)
SELECT
    nv.MaNV,
    CASE nv.rn % 4
        WHEN 0 THEN N'Thưởng'
        WHEN 1 THEN N'Công tác phí'
        WHEN 2 THEN N'Phạt'
        ELSE N'Ứng lương'
    END,
    CASE nv.rn % 4
        WHEN 0 THEN 500000.00 + (nv.rn % 10) * 250000.00
        WHEN 1 THEN 200000.00 + (nv.rn % 8) * 100000.00
        WHEN 2 THEN 50000.00 + (nv.rn % 6) * 25000.00
        ELSE 1000000.00 + (nv.rn % 5) * 500000.00
    END,
    CASE nv.rn % 4
        WHEN 0 THEN N'Thưởng KPI hoàn thành xuất sắc nhiệm vụ'
        WHEN 1 THEN N'Công tác và đi lại phục vụ dự án'
        WHEN 2 THEN N'Vi phạm nội quy lao động'
        ELSE N'Ứng lương đầu kỳ'
    END,
    10,
    2026,
    DATEADD(DAY, (nv.rn * 3) % 30, CAST('2026-10-01' AS DATETIME))
FROM (
    SELECT MaNV, ROW_NUMBER() OVER (ORDER BY MaNV) AS rn
    FROM (SELECT TOP 100 MaNV FROM dbo.NhanVien ORDER BY MaNV) t
) nv;
GO

-- ============================================================================
-- 10. CONG VIEC KANBAN (100 task trai deu 4 cot, gap-based ViTri 1000..)
-- ============================================================================
DECLARE @TrangThai TABLE (So INT, TrangThai NVARCHAR(20));
INSERT INTO @TrangThai (So, TrangThai) VALUES (0, N'Todo'), (1, N'InProgress'), (2, N'Review'), (3, N'Done');

DECLARE @DoUuTien TABLE (So INT, DoUuTien NVARCHAR(20));
INSERT INTO @DoUuTien (So, DoUuTien) VALUES (0, N'Thấp'), (1, N'Trung bình'), (2, N'Cao'), (3, N'Khẩn cấp');

DECLARE @TieuDe TABLE (So INT, TieuDe NVARCHAR(200));
INSERT INTO @TieuDe (So, TieuDe) VALUES
    (0, N'Thiết kế CSDL SQL Server và tối ưu chỉ mục'),
    (1, N'Xây dựng API xác thực JWT và phân quyền RBAC'),
    (2, N'Phát triển giao diện Kanban kéo thả'),
    (3, N'Viết Stored Procedure tính lương theo tháng'),
    (4, N'Tối ưu hiệu năng truy vấn báo cáo doanh thu'),
    (5, N'Kiểm thử tự động end-to-end bằng Playwright'),
    (6, N'Rà soát bảo mật OWASP và vá lỗ hổng'),
    (7, N'Tích hợp module chấm công GPS di động'),
    (8, N'Thiết kế dashboard KPI theo vai trò'),
    (9, N'Soát xét hợp đồng lao động định kỳ'),
    (10, N'Xây dựng chiến dịch quảng cáo đa kênh'),
    (11, N'Tối ưu hóa quy trình tuyển dụng nội bộ'),
    (12, N'Đào tạo nhân viên mới về quy trình Git Flow'),
    (13, N'Chuẩn hóa dữ liệu khách hàng và loại bỏ trùng lặp'),
    (14, N'Nâng cấp hạ tầng máy chủ và sao lưu định kỳ'),
    (15, N'Xây dựng quy trình xử lý khiếu nại khách hàng'),
    (16, N'Triển khai CI/CD cho môi trường staging'),
    (17, N'Nghiên cứu giải pháp lưu trữ đám mây tiết kiệm chi phí'),
    (18, N'Viết tài liệu API Contract cho frontend'),
    (19, N'Tổ chức đánh giá hiệu suất nhân sự quý 4');

DECLARE @j INT = 0;
DECLARE @tt NVARCHAR(20), @uu NVARCHAR(20), @td NVARCHAR(200), @viTri INT, @phuTrach NVARCHAR(5), @giao NVARCHAR(5);
WHILE @j < 100
BEGIN
    SET @tt = (SELECT TrangThai FROM @TrangThai WHERE So = @j % 4);
    SET @uu = (SELECT DoUuTien FROM @DoUuTien WHERE So = (@j * 3 + 1) % 4);
    SET @td = (SELECT TieuDe FROM @TieuDe WHERE So = @j % 20) + N' - đợt ' + CAST((@j / 20) + 1 AS NVARCHAR(2));

    -- ViTri gap-based 1000, reset theo tung cot
    SET @viTri = 1000 * ((@j / 4) + 1);
    SET @phuTrach = 'NV' + RIGHT('000' + CAST((@j * 7 + 1) % 100 AS NVARCHAR(3)), 3);
    SET @giao = 'NV' + RIGHT('000' + CAST((@j * 3) % 100 AS NVARCHAR(3)), 3);
    IF @phuTrach = 'NV000' SET @phuTrach = 'NV006';
    IF @giao = @phuTrach SET @giao = 'NV001';

    INSERT INTO dbo.CongViec (TieuDe, MoTa, MaNV_PhuTrach, MaNV_Giao, TrangThai, ViTri, DoUuTien, NgayBatDau, Deadline, NgayHoanThanh)
    VALUES (
        @td,
        N'Mô tả chi tiết cho công việc: ' + @td,
        @phuTrach,
        @giao,
        @tt,
        @viTri,
        @uu,
        DATEADD(DAY, -((@j % 30) + 1), CAST('2026-10-27' AS DATE)),
        DATEADD(DAY, (@j % 25) - 5, CAST('2026-11-05' AS DATE)),
        CASE WHEN @tt = N'Done' THEN DATEADD(DAY, -(@j % 10), CAST('2026-10-26' AS DATETIME)) ELSE NULL END
    );
    SET @j = @j + 1;
END
GO

-- ============================================================================
-- 11. BINH LUAN TASK (100 binh luan rai tren cac task)
-- ============================================================================
INSERT INTO dbo.BinhLuan (MaTask, MaNV, NoiDung, ThoiGian)
SELECT
    cv.MaTask,
    cv.MaNV,
    CASE cv.rn % 6
        WHEN 0 THEN N'Task này sắp tới hạn, mọi người đẩy nhanh tiến độ nhé!'
        WHEN 1 THEN N'Đã cập nhật xong phần xử lý chính, đang chờ review.'
        WHEN 2 THEN N'Cần bổ sung thêm test cho luồng lỗi trước khi merge.'
        WHEN 3 THEN N'Mình đã kiểm tra trên môi trường staging, chạy ổn định.'
        WHEN 4 THEN N'Có vướng mắc về yêu cầu nghiệp vụ, nhờ anh/chị làm rõ thêm.'
        ELSE N'Đã hoàn thành và cập nhật tài liệu liên quan.'
    END,
    DATEADD(HOUR, -(cv.rn % 72), GETDATE())
FROM (
    SELECT
        c.MaTask,
        ROW_NUMBER() OVER (ORDER BY c.MaTask) AS rn,
        'NV' + RIGHT('000' + CAST(((ROW_NUMBER() OVER (ORDER BY c.MaTask) * 13) % 80) + 1 AS NVARCHAR(3)), 3) AS MaNV
    FROM (SELECT TOP 100 MaTask FROM dbo.CongViec ORDER BY MaTask) c
) cv;
GO

PRINT N'====================================================================';
PRINT N'===> NAP DU LIEU MAU HOAN TAT! <===';
PRINT N'===> 10 phong ban, 8 chuc vu, 100 nhan vien, 100 hop dong, 100 nghi phep <===';
PRINT N'===> 100 cong viec Kanban, 100 binh luan, 100 chi phi phat sinh <===';
PRINT N'===> Tai khoan demo: admin/Admin@123, hr01/Hr@123, nv001/Nv@123 <===';
PRINT N'====================================================================';
GO

-- ============================================================================
-- KIEM TRA NHANH SO LUONG BAN GHI
-- ============================================================================
SELECT N'PhongBan' AS Bang, COUNT(*) AS SoLuong FROM dbo.PhongBan
UNION ALL SELECT N'ChucVu', COUNT(*) FROM dbo.ChucVu
UNION ALL SELECT N'NhanVien', COUNT(*) FROM dbo.NhanVien
UNION ALL SELECT N'TaiKhoan', COUNT(*) FROM dbo.TaiKhoan
UNION ALL SELECT N'HopDong', COUNT(*) FROM dbo.HopDong
UNION ALL SELECT N'ChamCong', COUNT(*) FROM dbo.ChamCong
UNION ALL SELECT N'NghiPhep', COUNT(*) FROM dbo.NghiPhep
UNION ALL SELECT N'BangLuong', COUNT(*) FROM dbo.BangLuong
UNION ALL SELECT N'ChiPhiPhatSinh', COUNT(*) FROM dbo.ChiPhiPhatSinh
UNION ALL SELECT N'CongViec', COUNT(*) FROM dbo.CongViec
UNION ALL SELECT N'BinhLuan', COUNT(*) FROM dbo.BinhLuan;
GO
