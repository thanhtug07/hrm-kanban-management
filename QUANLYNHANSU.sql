    -- ============================================================================
    -- BÀI TẬP LỚN CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ NHÂN SỰ (HRM) + KANBAN 4 CỘT
    -- DATABASE: QUANLYNHANSU (FILE DUY NHẤT CHẠY TRỌN VẸN 100%)
    -- Hướng dẫn: Mở file này trong SSMS và nhấn Execute (F5) là xong toàn bộ!
    -- ============================================================================
    GO

    USE master;
    GO

    -- 1. KHỞI TẠO CƠ SỞ DỮ LIỆU RIÊNG BIỆT (QUANLYNHANSU)
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QUANLYNHANSU')
    BEGIN
        CREATE DATABASE QUANLYNHANSU;
        PRINT N'-> Đã tạo mới cơ sở dữ liệu QUANLYNHANSU thành công.';
    END
    GO

    USE QUANLYNHANSU;
    GO

    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;
    GO

    PRINT N'====================================================================';
    PRINT N'BẮT ĐẦU TẠO CẤU TRÚC 11 BẢNG VÀ CÁC RÀNG BUỘC TOÀN VẸN...';
    PRINT N'====================================================================';

    -- 1.1. BẢNG PHÒNG BAN (PhongBan)
    IF OBJECT_ID(N'dbo.PhongBan', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.PhongBan (
            MaPB CHAR(5) NOT NULL,
            TenPB NVARCHAR(100) NOT NULL,
            MoTa NVARCHAR(255) NULL,
            NgayThanhLap DATE NULL,
            MaNV_QL CHAR(5) NULL, -- Khóa ngoại trỏ đến NhanVien (Trưởng phòng)
            CONSTRAINT PK_PhongBan PRIMARY KEY CLUSTERED (MaPB),
            CONSTRAINT UQ_PhongBan_TenPB UNIQUE (TenPB)
        );
    END
    GO

    -- 1.2. BẢNG CHỨC VỤ (ChucVu)
    IF OBJECT_ID(N'dbo.ChucVu', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ChucVu (
            MaCV CHAR(5) NOT NULL,
            TenCV NVARCHAR(50) NOT NULL,
            LuongCoBan DECIMAL(18,2) NOT NULL,
            MoTa NVARCHAR(255) NULL,
            CONSTRAINT PK_ChucVu PRIMARY KEY CLUSTERED (MaCV),
            CONSTRAINT UQ_ChucVu_TenCV UNIQUE (TenCV),
            CONSTRAINT CK_ChucVu_LuongCoBan CHECK (LuongCoBan >= 0)
        );
    END
    GO

    -- 1.3. BẢNG NHÂN VIÊN (NhanVien)
    IF OBJECT_ID(N'dbo.NhanVien', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.NhanVien (
            MaNV CHAR(5) NOT NULL,
            HoTen NVARCHAR(100) NOT NULL,
            GioiTinh NVARCHAR(5) NOT NULL,
            NgaySinh DATE NOT NULL,
            CCCD CHAR(12) NOT NULL,
            SDT VARCHAR(15) NULL,
            Email VARCHAR(100) NULL,
            DiaChi NVARCHAR(255) NULL,
            MaPB CHAR(5) NOT NULL,
            MaCV CHAR(5) NOT NULL,
            NgayVaoLam DATE NOT NULL,
            TrangThai NVARCHAR(20) NOT NULL DEFAULT N'Đang làm',
            CONSTRAINT PK_NhanVien PRIMARY KEY CLUSTERED (MaNV),
            CONSTRAINT UQ_NhanVien_CCCD UNIQUE (CCCD),
            CONSTRAINT CK_NhanVien_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ')),
            CONSTRAINT CK_NhanVien_NgaySinh CHECK (NgaySinh <= GETDATE()),
            CONSTRAINT CK_NhanVien_TrangThai CHECK (TrangThai IN (N'Đang làm', N'Nghỉ việc', N'Tạm nghỉ')),
            CONSTRAINT FK_NhanVien_PhongBan FOREIGN KEY (MaPB) REFERENCES dbo.PhongBan(MaPB) ON DELETE NO ACTION,
            CONSTRAINT FK_NhanVien_ChucVu FOREIGN KEY (MaCV) REFERENCES dbo.ChucVu(MaCV) ON DELETE NO ACTION
        );
    END
    GO

    -- Xử lý Circular FK: PhongBan(MaNV_QL) -> NhanVien(MaNV)
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_PhongBan_NhanVien_QL')
    BEGIN
        ALTER TABLE dbo.PhongBan
        ADD CONSTRAINT FK_PhongBan_NhanVien_QL 
        FOREIGN KEY (MaNV_QL) REFERENCES dbo.NhanVien(MaNV) ON DELETE SET NULL;
    END
    GO

    -- 1.4. BẢNG HỢP ĐỒNG (HopDong)
    IF OBJECT_ID(N'dbo.HopDong', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.HopDong (
            MaHD CHAR(6) NOT NULL,
            MaNV CHAR(5) NOT NULL,
            LoaiHD NVARCHAR(30) NOT NULL,
            NgayBatDau DATE NOT NULL,
            NgayKetThuc DATE NULL,
            LuongThoaThuan DECIMAL(18,2) NOT NULL,
            TrangThai NVARCHAR(20) NOT NULL DEFAULT N'Hiệu lực',
            CONSTRAINT PK_HopDong PRIMARY KEY CLUSTERED (MaHD),
            CONSTRAINT FK_HopDong_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE CASCADE,
            CONSTRAINT CK_HopDong_LoaiHD CHECK (LoaiHD IN (N'Thử việc', N'Chính thức', N'Thời vụ')),
            CONSTRAINT CK_HopDong_TrangThai CHECK (TrangThai IN (N'Hiệu lực', N'Hết hạn', N'Đã huỷ')),
            CONSTRAINT CK_HopDong_Ngay CHECK (NgayKetThuc IS NULL OR NgayKetThuc >= NgayBatDau),
            CONSTRAINT CK_HopDong_Luong CHECK (LuongThoaThuan >= 0)
        );
    END
    GO

    -- 1.5. BẢNG CHẤM CÔNG (ChamCong)
    IF OBJECT_ID(N'dbo.ChamCong', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ChamCong (
            MaCC INT IDENTITY(1,1) NOT NULL,
            MaNV CHAR(5) NOT NULL,
            Ngay DATE NOT NULL,
            GioVao TIME NULL,
            GioRa TIME NULL,
            TrangThai NVARCHAR(20) NOT NULL,
            CONSTRAINT PK_ChamCong PRIMARY KEY CLUSTERED (MaCC),
            CONSTRAINT FK_ChamCong_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE CASCADE,
            CONSTRAINT CK_ChamCong_TrangThai CHECK (TrangThai IN (N'Đủ công', N'Vắng', N'Trễ', N'Nghỉ phép')),
            CONSTRAINT UQ_ChamCong_MaNV_Ngay UNIQUE (MaNV, Ngay)
        );
    END
    GO

    -- 1.6. BẢNG NGHỈ PHÉP (NghiPhep)
    IF OBJECT_ID(N'dbo.NghiPhep', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.NghiPhep (
            MaNP INT IDENTITY(1,1) NOT NULL,
            MaNV CHAR(5) NOT NULL,
            LoaiPhep NVARCHAR(30) NOT NULL,
            TuNgay DATE NOT NULL,
            DenNgay DATE NOT NULL,
            LyDo NVARCHAR(255) NULL,
            TrangThai NVARCHAR(20) NOT NULL DEFAULT N'Chờ duyệt',
            MaNV_Duyet CHAR(5) NULL,
            NgayDuyet DATETIME NULL,
            CONSTRAINT PK_NghiPhep PRIMARY KEY CLUSTERED (MaNP),
            CONSTRAINT FK_NghiPhep_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE CASCADE,
            CONSTRAINT FK_NghiPhep_NhanVien_Duyet FOREIGN KEY (MaNV_Duyet) REFERENCES dbo.NhanVien(MaNV) ON DELETE NO ACTION,
            CONSTRAINT CK_NghiPhep_LoaiPhep CHECK (LoaiPhep IN (N'Phép năm', N'Bệnh', N'Thai sản', N'Không lương')),
            CONSTRAINT CK_NghiPhep_TrangThai CHECK (TrangThai IN (N'Chờ duyệt', N'Đã duyệt', N'Từ chối')),
            CONSTRAINT CK_NghiPhep_Ngay CHECK (DenNgay >= TuNgay)
        );
    END
    GO

    -- 1.7. BẢNG BẢNG LƯƠNG (BangLuong)
    IF OBJECT_ID(N'dbo.BangLuong', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.BangLuong (
            MaBL INT IDENTITY(1,1) NOT NULL,
            MaNV CHAR(5) NOT NULL,
            Thang TINYINT NOT NULL,
            Nam SMALLINT NOT NULL,
            SoNgayCong INT NOT NULL DEFAULT 0,
            LuongCoBan DECIMAL(18,2) NOT NULL,
            PhuCap DECIMAL(18,2) NOT NULL DEFAULT 0,
            KhauTru DECIMAL(18,2) NOT NULL DEFAULT 0,
            ThucLinh AS (LuongCoBan + PhuCap - KhauTru) PERSISTED,
            CONSTRAINT PK_BangLuong PRIMARY KEY CLUSTERED (MaBL),
            CONSTRAINT FK_BangLuong_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE CASCADE,
            CONSTRAINT CK_BangLuong_Thang CHECK (Thang BETWEEN 1 AND 12),
            CONSTRAINT CK_BangLuong_Nam CHECK (Nam >= 2000),
            CONSTRAINT UQ_BangLuong_MaNV_Thang_Nam UNIQUE (MaNV, Thang, Nam)
        );
    END
    GO

    -- 1.7.1. BẢNG CHI PHÍ PHÁT SINH LƯƠNG (ChiPhiPhatSinh)
    IF OBJECT_ID(N'dbo.ChiPhiPhatSinh', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ChiPhiPhatSinh (
            MaPS INT IDENTITY(1,1) NOT NULL,
            MaNV CHAR(5) NOT NULL,
            Loai NVARCHAR(50) NOT NULL, -- Thưởng, Phạt, Ứng lương, Công tác phí
            SoTien DECIMAL(18,2) NOT NULL,
            LyDo NVARCHAR(255) NULL,
            Thang TINYINT NOT NULL,
            Nam SMALLINT NOT NULL,
            NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
            CONSTRAINT PK_ChiPhiPhatSinh PRIMARY KEY CLUSTERED (MaPS),
            CONSTRAINT FK_ChiPhiPhatSinh_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE NO ACTION,
            CONSTRAINT CK_ChiPhiPhatSinh_Loai CHECK (Loai IN (N'Thưởng', N'Phạt', N'Ứng lương', N'Công tác phí')),
            CONSTRAINT CK_ChiPhiPhatSinh_SoTien CHECK (SoTien >= 0),
            CONSTRAINT CK_ChiPhiPhatSinh_Thang CHECK (Thang BETWEEN 1 AND 12),
            CONSTRAINT CK_ChiPhiPhatSinh_Nam CHECK (Nam >= 2000)
        );
    END
    GO

    -- Đảm bảo các CHECK constraint cho ChiPhiPhatSinh tồn tại (cho DB cũ đã tạo thiếu ràng buộc)
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ChiPhiPhatSinh_Loai')
        ALTER TABLE dbo.ChiPhiPhatSinh ADD CONSTRAINT CK_ChiPhiPhatSinh_Loai CHECK (Loai IN (N'Thưởng', N'Phạt', N'Ứng lương', N'Công tác phí'));
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ChiPhiPhatSinh_SoTien')
        ALTER TABLE dbo.ChiPhiPhatSinh ADD CONSTRAINT CK_ChiPhiPhatSinh_SoTien CHECK (SoTien >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ChiPhiPhatSinh_Thang')
        ALTER TABLE dbo.ChiPhiPhatSinh ADD CONSTRAINT CK_ChiPhiPhatSinh_Thang CHECK (Thang BETWEEN 1 AND 12);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ChiPhiPhatSinh_Nam')
        ALTER TABLE dbo.ChiPhiPhatSinh ADD CONSTRAINT CK_ChiPhiPhatSinh_Nam CHECK (Nam >= 2000);
    GO

    -- 1.8. BẢNG CÔNG VIỆC - KANBAN 4 CỘT (CongViec)
    IF OBJECT_ID(N'dbo.CongViec', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.CongViec (
            MaTask INT IDENTITY(1,1) NOT NULL,
            TieuDe NVARCHAR(200) NOT NULL,
            MoTa NVARCHAR(MAX) NULL,
            MaNV_PhuTrach CHAR(5) NOT NULL,
            MaNV_Giao CHAR(5) NOT NULL,
            TrangThai NVARCHAR(20) NOT NULL DEFAULT N'Todo',
            ViTri INT NOT NULL, -- Gap 1000 cho re-ordering mượt mà
            DoUuTien NVARCHAR(20) NOT NULL DEFAULT N'Trung bình',
            NgayBatDau DATE NULL,
            Deadline DATE NULL,
            NgayHoanThanh DATETIME NULL,
            NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
            NgayCapNhat DATETIME NOT NULL DEFAULT GETDATE(),
            DaXoa BIT NOT NULL DEFAULT 0,
            CONSTRAINT PK_CongViec PRIMARY KEY CLUSTERED (MaTask),
            CONSTRAINT FK_CongViec_NhanVien_PhuTrach FOREIGN KEY (MaNV_PhuTrach) REFERENCES dbo.NhanVien(MaNV) ON DELETE NO ACTION,
            CONSTRAINT FK_CongViec_NhanVien_Giao FOREIGN KEY (MaNV_Giao) REFERENCES dbo.NhanVien(MaNV) ON DELETE NO ACTION,
            CONSTRAINT CK_CongViec_TrangThai CHECK (TrangThai IN (N'Todo', N'InProgress', N'Review', N'Done')),
            CONSTRAINT CK_CongViec_DoUuTien CHECK (DoUuTien IN (N'Thấp', N'Trung bình', N'Cao', N'Khẩn cấp')),
            CONSTRAINT CK_CongViec_Ngay CHECK (Deadline IS NULL OR NgayBatDau IS NULL OR Deadline >= NgayBatDau)
        );
    END
    GO

    -- 1.9. BẢNG TÀI KHOẢN (TaiKhoan)
    IF OBJECT_ID(N'dbo.TaiKhoan', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.TaiKhoan (
            MaTK INT IDENTITY(1,1) NOT NULL,
            TenDangNhap VARCHAR(50) NOT NULL,
            MatKhauHash VARCHAR(255) NOT NULL,
            VaiTro NVARCHAR(20) NOT NULL,
            MaNV CHAR(5) NULL,
            TrangThai BIT NOT NULL DEFAULT 1,
            NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
            CONSTRAINT PK_TaiKhoan PRIMARY KEY CLUSTERED (MaTK),
            CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE (TenDangNhap),
            CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN (N'Admin', N'HR', N'TruongPhong', N'NhanVien')),
            CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE SET NULL
        );
    END
    GO

    -- Đảm bảo CHECK VaiTro cho phép TruongPhong (cho DB cũ đã tạo thiếu)
    IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_TaiKhoan_VaiTro')
    BEGIN
        ALTER TABLE dbo.TaiKhoan DROP CONSTRAINT CK_TaiKhoan_VaiTro;
    END
    ALTER TABLE dbo.TaiKhoan ADD CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN (N'Admin', N'HR', N'TruongPhong', N'NhanVien'));
    GO

    -- 1.10. BẢNG BÌNH LUẬN TRÊN TASK (BinhLuan)
    IF OBJECT_ID(N'dbo.BinhLuan', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.BinhLuan (
            MaBL INT IDENTITY(1,1) NOT NULL,
            MaTask INT NOT NULL,
            MaNV CHAR(5) NOT NULL,
            NoiDung NVARCHAR(500) NOT NULL,
            ThoiGian DATETIME NOT NULL DEFAULT GETDATE(),
            CONSTRAINT PK_BinhLuan PRIMARY KEY CLUSTERED (MaBL),
            CONSTRAINT FK_BinhLuan_CongViec FOREIGN KEY (MaTask) REFERENCES dbo.CongViec(MaTask) ON DELETE CASCADE,
            CONSTRAINT FK_BinhLuan_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE CASCADE
        );
    END
    GO

    -- 1.11. BẢNG CẤU HÌNH KHUNG GIỜ CHẤM CÔNG (CauHinhChamCong)
    IF OBJECT_ID(N'dbo.CauHinhChamCong', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.CauHinhChamCong (
            MaCH INT IDENTITY(1,1) NOT NULL,
            GioBatDau TIME NOT NULL,      -- giờ bắt đầu ca (ví dụ 08:00)
            GioKetThuc TIME NOT NULL,     -- giờ kết thúc ca (ví dụ 17:30)
            PhutChoPhepSom INT NOT NULL DEFAULT 15, -- cho phép check-in sớm tối đa (phút)
            PhutChoPhepTre INT NOT NULL DEFAULT 0,  -- cho phép check-in trễ tối đa (phút)
            BatBuocCheckOutSauKetThuc BIT NOT NULL DEFAULT 1, -- chỉ check-out sau giờ kết thúc
            NgayCapNhat DATETIME NOT NULL DEFAULT GETDATE(),
            CONSTRAINT PK_CauHinhChamCong PRIMARY KEY CLUSTERED (MaCH),
            CONSTRAINT CK_CauHinh_Gio CHECK (GioKetThuc > GioBatDau),
            CONSTRAINT CK_CauHinh_PhutSom CHECK (PhutChoPhepSom >= 0 AND PhutChoPhepSom <= 120),
            CONSTRAINT CK_CauHinh_PhutTre CHECK (PhutChoPhepTre >= 0 AND PhutChoPhepTre <= 120)
        );
    END
    GO

    -- Seed cấu hình mặc định: ca 08:00 - 17:30, cho sớm 15 phút, trễ 0 phút
    IF NOT EXISTS (SELECT 1 FROM dbo.CauHinhChamCong)
    BEGIN
        INSERT INTO dbo.CauHinhChamCong (GioBatDau, GioKetThuc, PhutChoPhepSom, PhutChoPhepTre, BatBuocCheckOutSauKetThuc)
        VALUES ('08:00', '17:30', 15, 0, 1);
    END
    GO

    -- CÁC CHỈ MỤC NON-CLUSTERED INDEXES TỐI ƯU
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_NhanVien_MaPB')
        CREATE NONCLUSTERED INDEX IX_NhanVien_MaPB ON dbo.NhanVien (MaPB);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_NhanVien_MaCV')
        CREATE NONCLUSTERED INDEX IX_NhanVien_MaCV ON dbo.NhanVien (MaCV);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_NhanVien_TrangThai')
        CREATE NONCLUSTERED INDEX IX_NhanVien_TrangThai ON dbo.NhanVien (TrangThai);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChiPhiPhatSinh_MaNV_Thang_Nam')
        CREATE NONCLUSTERED INDEX IX_ChiPhiPhatSinh_MaNV_Thang_Nam ON dbo.ChiPhiPhatSinh (MaNV, Thang, Nam);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChamCong_Ngay')
        CREATE NONCLUSTERED INDEX IX_ChamCong_Ngay ON dbo.ChamCong (Ngay);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ChamCong_MaNV_Ngay')
        CREATE NONCLUSTERED INDEX IX_ChamCong_MaNV_Ngay ON dbo.ChamCong (MaNV, Ngay);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CongViec_TrangThai_ViTri')
        CREATE NONCLUSTERED INDEX IX_CongViec_TrangThai_ViTri ON dbo.CongViec (TrangThai, ViTri) WHERE DaXoa = 0;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CongViec_MaNV_PhuTrach')
        CREATE NONCLUSTERED INDEX IX_CongViec_MaNV_PhuTrach ON dbo.CongViec (MaNV_PhuTrach) WHERE DaXoa = 0;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CongViec_Deadline')
        CREATE NONCLUSTERED INDEX IX_CongViec_Deadline ON dbo.CongViec (Deadline) WHERE TrangThai <> N'Done' AND DaXoa = 0;
    GO

    PRINT N'====================================================================';
    PRINT N'BẮT ĐẦU TẠO 6 KHUNG NHÌN (VIEWS)...';
    PRINT N'====================================================================';
    GO

    -- 2.1. View danh sách nhân viên
    CREATE OR ALTER VIEW dbo.VW_DanhSachNhanVien
    AS
    SELECT 
        nv.MaNV,
        nv.HoTen,
        nv.GioiTinh,
        nv.NgaySinh,
        DATEDIFF(YEAR, nv.NgaySinh, GETDATE()) AS Tuoi,
        nv.CCCD,
        nv.SDT,
        nv.Email,
        nv.DiaChi,
        nv.MaPB,
        pb.TenPB,
        nv.MaCV,
        cv.TenCV,
        cv.LuongCoBan,
        nv.NgayVaoLam,
        nv.TrangThai,
        CASE 
            WHEN pb.MaNV_QL = nv.MaNV THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS LaTruongPhong
    FROM dbo.NhanVien nv
    JOIN dbo.PhongBan pb ON nv.MaPB = pb.MaPB
    JOIN dbo.ChucVu cv ON nv.MaCV = cv.MaCV;
    GO

    -- 2.2. View chấm công tháng
    CREATE OR ALTER VIEW dbo.VW_ChamCongThang
    AS
    SELECT 
        cc.MaNV,
        nv.HoTen,
        MONTH(cc.Ngay) AS Thang,
        YEAR(cc.Ngay) AS Nam,
        COUNT(CASE WHEN cc.TrangThai = N'Đủ công' THEN 1 END) AS SoNgayDuCong,
        COUNT(CASE WHEN cc.TrangThai = N'Trễ' THEN 1 END) AS SoLanTre,
        COUNT(CASE WHEN cc.TrangThai = N'Nghỉ phép' THEN 1 END) AS SoNgayNghiPhep,
        COUNT(CASE WHEN cc.TrangThai = N'Vắng' THEN 1 END) AS SoNgayVang,
        COUNT(*) AS TongNgayGhiNhan
    FROM dbo.ChamCong cc
    JOIN dbo.NhanVien nv ON cc.MaNV = nv.MaNV
    GROUP BY cc.MaNV, nv.HoTen, MONTH(cc.Ngay), YEAR(cc.Ngay);
    GO

    -- 2.3. View bảng lương chi tiết
    CREATE OR ALTER VIEW dbo.VW_BangLuongChiTiet
    AS
    SELECT 
        bl.MaBL,
        bl.MaNV,
        nv.HoTen,
        pb.TenPB,
        cv.TenCV,
        bl.Thang,
        bl.Nam,
        bl.SoNgayCong,
        bl.LuongCoBan,
        bl.PhuCap,
        bl.KhauTru,
        bl.ThucLinh
    FROM dbo.BangLuong bl
    JOIN dbo.NhanVien nv ON bl.MaNV = nv.MaNV
    JOIN dbo.PhongBan pb ON nv.MaPB = pb.MaPB
    JOIN dbo.ChucVu cv ON nv.MaCV = cv.MaCV;
    GO

    -- 2.4. View Kanban Board
    CREATE OR ALTER VIEW dbo.VW_BoardKanban
    AS
    SELECT 
        cv.MaTask,
        cv.TieuDe,
        cv.MoTa,
        cv.TrangThai,
        cv.ViTri,
        cv.DoUuTien,
        cv.NgayBatDau,
        cv.Deadline,
        cv.NgayHoanThanh,
        cv.MaNV_PhuTrach,
        nv_pt.HoTen AS TenNV_PhuTrach,
        cv.MaNV_Giao,
        nv_giao.HoTen AS TenNV_Giao,
        cv.NgayTao,
        cv.NgayCapNhat,
        CASE 
            WHEN cv.TrangThai <> N'Done' AND cv.Deadline IS NOT NULL AND cv.Deadline < CAST(GETDATE() AS DATE) 
            THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS LaQuaHan,
        ISNULL(cm.SoBinhLuan, 0) AS SoBinhLuan
    FROM dbo.CongViec cv
    JOIN dbo.NhanVien nv_pt ON cv.MaNV_PhuTrach = nv_pt.MaNV
    JOIN dbo.NhanVien nv_giao ON cv.MaNV_Giao = nv_giao.MaNV
    LEFT JOIN (
        SELECT MaTask, COUNT(*) AS SoBinhLuan
        FROM dbo.BinhLuan
        GROUP BY MaTask
    ) cm ON cv.MaTask = cm.MaTask
    WHERE cv.DaXoa = 0;
    GO

    -- 2.5. View Task quá hạn
    CREATE OR ALTER VIEW dbo.VW_TaskQuaHan
    AS
    SELECT 
        cv.MaTask,
        cv.TieuDe,
        cv.TrangThai,
        cv.DoUuTien,
        cv.Deadline,
        DATEDIFF(DAY, cv.Deadline, CAST(GETDATE() AS DATE)) AS SoNgayTre,
        cv.MaNV_PhuTrach,
        nv.HoTen AS TenNV_PhuTrach,
        nv.Email AS EmailNV_PhuTrach
    FROM dbo.CongViec cv
    JOIN dbo.NhanVien nv ON cv.MaNV_PhuTrach = nv.MaNV
    WHERE cv.TrangThai <> N'Done' 
    AND cv.Deadline IS NOT NULL 
    AND cv.Deadline < CAST(GETDATE() AS DATE)
    AND cv.DaXoa = 0;
    GO

    -- 2.6. View năng suất nhân viên
    CREATE OR ALTER VIEW dbo.VW_NangSuatNhanVien
    AS
    SELECT 
        nv.MaNV,
        nv.HoTen,
        pb.TenPB,
        COUNT(cv.MaTask) AS TongTask,
        COUNT(CASE WHEN cv.TrangThai = N'Todo' THEN 1 END) AS SoTaskTodo,
        COUNT(CASE WHEN cv.TrangThai = N'InProgress' THEN 1 END) AS SoTaskDangLam,
        COUNT(CASE WHEN cv.TrangThai = N'Done' THEN 1 END) AS SoTaskHoanThanh,
        COUNT(CASE WHEN cv.TrangThai <> N'Done' AND cv.Deadline < CAST(GETDATE() AS DATE) THEN 1 END) AS SoTaskQuaHan
    FROM dbo.NhanVien nv
    JOIN dbo.PhongBan pb ON nv.MaPB = pb.MaPB
    LEFT JOIN dbo.CongViec cv ON nv.MaNV = cv.MaNV_PhuTrach AND cv.DaXoa = 0
    WHERE nv.TrangThai = N'Đang làm'
    GROUP BY nv.MaNV, nv.HoTen, pb.TenPB;
    GO

    PRINT N'====================================================================';
    PRINT N'BẮT ĐẦU TẠO 3 THỦ TỤC LƯU TRỮ (STORED PROCEDURES)...';
    PRINT N'====================================================================';
    GO

    -- 3.1. SP Thêm nhân viên tự sinh mã NVxxx
    CREATE OR ALTER PROCEDURE dbo.SP_ThemNhanVien
        @HoTen NVARCHAR(100),
        @GioiTinh NVARCHAR(5),
        @NgaySinh DATE,
        @CCCD CHAR(12),
        @SDT VARCHAR(15) = NULL,
        @Email VARCHAR(100) = NULL,
        @DiaChi NVARCHAR(255) = NULL,
        @MaPB CHAR(5),
        @MaCV CHAR(5),
        @NgayVaoLam DATE = NULL,
        @MaNVmoi CHAR(5) = NULL OUTPUT
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRANSACTION;
        BEGIN TRY
            IF EXISTS (SELECT 1 FROM dbo.NhanVien WHERE CCCD = @CCCD)
                RAISERROR(N'Số CCCD đã tồn tại trong hệ thống!', 16, 1);

            IF NOT EXISTS (SELECT 1 FROM dbo.PhongBan WHERE MaPB = @MaPB)
                RAISERROR(N'Mã phòng ban không hợp lệ!', 16, 1);

            IF NOT EXISTS (SELECT 1 FROM dbo.ChucVu WHERE MaCV = @MaCV)
                RAISERROR(N'Mã chức vụ không hợp lệ!', 16, 1);

            DECLARE @NextId INT = 1;
            SELECT @NextId = ISNULL(MAX(CAST(SUBSTRING(MaNV, 3, 3) AS INT)), 0) + 1
            FROM dbo.NhanVien WITH (UPDLOCK, HOLDLOCK)
            WHERE MaNV LIKE 'NV[0-9][0-9][0-9]';

            DECLARE @NewMaNV CHAR(5) = 'NV' + RIGHT('000' + CAST(@NextId AS VARCHAR(3)), 3);

            IF @NgayVaoLam IS NULL
                SET @NgayVaoLam = CAST(GETDATE() AS DATE);

            INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
            VALUES (@NewMaNV, @HoTen, @GioiTinh, @NgaySinh, @CCCD, @SDT, @Email, @DiaChi, @MaPB, @MaCV, @NgayVaoLam, N'Đang làm');

            SET @MaNVmoi = @NewMaNV;
            COMMIT TRANSACTION;
            SELECT * FROM dbo.VW_DanhSachNhanVien WHERE MaNV = @NewMaNV;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END;
    GO

    -- 3.2. SP Di chuyển task Kanban (Gap-based ordering)
    CREATE OR ALTER PROCEDURE dbo.SP_DiChuyenTask
        @MaTask INT,
        @TrangThaiMoi NVARCHAR(20),
        @ViTriMoi INT
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRANSACTION;
        BEGIN TRY
            IF NOT EXISTS (SELECT 1 FROM dbo.CongViec WHERE MaTask = @MaTask AND DaXoa = 0)
                RAISERROR(N'Công việc không tồn tại hoặc đã bị xoá!', 16, 1);

            IF @TrangThaiMoi NOT IN (N'Todo', N'InProgress', N'Review', N'Done')
                RAISERROR(N'Trạng thái cột không hợp lệ (Todo, InProgress, Review, Done)!', 16, 1);

            UPDATE dbo.CongViec
            SET TrangThai = @TrangThaiMoi,
                ViTri = @ViTriMoi,
                NgayCapNhat = GETDATE()
            WHERE MaTask = @MaTask;

            -- Tự động re-index nếu bị trùng vị trí
            IF EXISTS (
                SELECT ViTri 
                FROM dbo.CongViec 
                WHERE TrangThai = @TrangThaiMoi AND DaXoa = 0 
                GROUP BY ViTri 
                HAVING COUNT(*) > 1
            )
            BEGIN
                ;WITH ReorderCTE AS (
                    SELECT MaTask, ROW_NUMBER() OVER (ORDER BY ViTri, NgayCapNhat DESC) * 1000 AS ViTriMoiChuan
                    FROM dbo.CongViec
                    WHERE TrangThai = @TrangThaiMoi AND DaXoa = 0
                )
                UPDATE cv
                SET cv.ViTri = r.ViTriMoiChuan
                FROM dbo.CongViec cv
                JOIN ReorderCTE r ON cv.MaTask = r.MaTask;
            END

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END;
    GO

    -- 3.3. SP Tính lương tháng
    CREATE OR ALTER PROCEDURE dbo.SP_TinhLuongThang
        @Thang TINYINT,
        @Nam SMALLINT
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRANSACTION;
        BEGIN TRY
            IF @Thang NOT BETWEEN 1 AND 12 OR @Nam < 2000
                RAISERROR(N'Tháng hoặc năm tính lương không hợp lệ!', 16, 1);

            DELETE FROM dbo.BangLuong WHERE Thang = @Thang AND Nam = @Nam;

            INSERT INTO dbo.BangLuong (MaNV, Thang, Nam, SoNgayCong, LuongCoBan, PhuCap, KhauTru)
            SELECT 
                nv.MaNV,
                @Thang,
                @Nam,
                ISNULL(cc.SoNgayCong, 0) AS SoNgayCong,
                ROUND((cv.LuongCoBan / 22.0) * ISNULL(cc.SoNgayCong, 0), 0) AS LuongCoBan,
                500000.00 AS PhuCap,
                ISNULL(cc.SoLanTre, 0) * 50000.00 AS KhauTru
            FROM dbo.NhanVien nv
            JOIN dbo.ChucVu cv ON nv.MaCV = cv.MaCV
            LEFT JOIN (
                SELECT 
                    MaNV, 
                    COUNT(CASE WHEN TrangThai = N'Đủ công' THEN 1 END) AS SoNgayCong,
                    COUNT(CASE WHEN TrangThai = N'Trễ' THEN 1 END) AS SoLanTre
                FROM dbo.ChamCong
                WHERE MONTH(Ngay) = @Thang AND YEAR(Ngay) = @Nam
                GROUP BY MaNV
            ) cc ON nv.MaNV = cc.MaNV
            WHERE nv.TrangThai = N'Đang làm';

            COMMIT TRANSACTION;
            SELECT COUNT(*) AS SoNhanVienTinhLuong, @Thang AS Thang, @Nam AS Nam
            FROM dbo.BangLuong WHERE Thang = @Thang AND Nam = @Nam;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END;
    GO

    PRINT N'====================================================================';
    PRINT N'BẮT ĐẦU TẠO 3 TRIGGERS TỰ ĐỘNG HÓA...';
    PRINT N'====================================================================';
    GO

    -- 4.1. Trigger tự set ngày hoàn thành trên Kanban
    CREATE OR ALTER TRIGGER dbo.TR_CongViec_Update
    ON dbo.CongViec
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        IF TRIGGER_NESTLEVEL() > 1 RETURN;

        IF UPDATE(TrangThai)
        BEGIN
            UPDATE cv
            SET cv.NgayHoanThanh = GETDATE(), cv.NgayCapNhat = GETDATE()
            FROM dbo.CongViec cv
            JOIN inserted i ON cv.MaTask = i.MaTask
            JOIN deleted d ON cv.MaTask = d.MaTask
            WHERE i.TrangThai = N'Done' AND d.TrangThai <> N'Done';

            UPDATE cv
            SET cv.NgayHoanThanh = NULL, cv.NgayCapNhat = GETDATE()
            FROM dbo.CongViec cv
            JOIN inserted i ON cv.MaTask = i.MaTask
            JOIN deleted d ON cv.MaTask = d.MaTask
            WHERE i.TrangThai <> N'Done' AND d.TrangThai = N'Done';
        END
    END;
    GO

    -- 4.2. Trigger đồng bộ ngày nghỉ vào bảng chấm công
    CREATE OR ALTER TRIGGER dbo.TR_NghiPhep_Update
    ON dbo.NghiPhep
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        IF TRIGGER_NESTLEVEL() > 1 RETURN;

        IF UPDATE(TrangThai)
        BEGIN
            DECLARE @MaNP INT, @MaNV CHAR(5), @TuNgay DATE, @DenNgay DATE;
            DECLARE curDuyet CURSOR LOCAL FAST_FORWARD FOR
                SELECT i.MaNP, i.MaNV, i.TuNgay, i.DenNgay
                FROM inserted i
                JOIN deleted d ON i.MaNP = d.MaNP
                WHERE i.TrangThai = N'Đã duyệt' AND d.TrangThai <> N'Đã duyệt';

            OPEN curDuyet;
            FETCH NEXT FROM curDuyet INTO @MaNP, @MaNV, @TuNgay, @DenNgay;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                DECLARE @CurrentDate DATE = @TuNgay;
                WHILE @CurrentDate <= @DenNgay
                BEGIN
                    IF ((DATEPART(dw, @CurrentDate) + @@DATEFIRST - 1) % 7) NOT IN (0, 6)
                    BEGIN
                        IF EXISTS (SELECT 1 FROM dbo.ChamCong WHERE MaNV = @MaNV AND Ngay = @CurrentDate)
                        BEGIN
                            UPDATE dbo.ChamCong 
                            SET TrangThai = N'Nghỉ phép', GioVao = NULL, GioRa = NULL
                            WHERE MaNV = @MaNV AND Ngay = @CurrentDate;
                        END
                        ELSE
                        BEGIN
                            INSERT INTO dbo.ChamCong (MaNV, Ngay, GioVao, GioRa, TrangThai)
                            VALUES (@MaNV, @CurrentDate, NULL, NULL, N'Nghỉ phép');
                        END
                    END
                    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
                END
                FETCH NEXT FROM curDuyet INTO @MaNP, @MaNV, @TuNgay, @DenNgay;
            END

            CLOSE curDuyet;
            DEALLOCATE curDuyet;
        END
    END;
    GO

    -- 4.3. Trigger tự động đổi trạng thái hợp đồng hết hạn
    CREATE OR ALTER TRIGGER dbo.TR_HopDong_Update
    ON dbo.HopDong
    AFTER UPDATE, INSERT
    AS
    BEGIN
        SET NOCOUNT ON;
        IF TRIGGER_NESTLEVEL() > 1 RETURN;

        UPDATE hd
        SET hd.TrangThai = N'Hết hạn'
        FROM dbo.HopDong hd
        JOIN inserted i ON hd.MaHD = i.MaHD
        WHERE hd.NgayKetThuc IS NOT NULL 
        AND hd.NgayKetThuc < CAST(GETDATE() AS DATE)
        AND hd.TrangThai = N'Hiệu lực';
    END;
    GO

    PRINT N'====================================================================';
    PRINT N'===> HOAN TAT THIET LAP CAU TRUC CO SO DU LIEU QUANLYNHANSU! <===';
    PRINT N'===> (Chua nap du lieu mau - ban co the them seed sau) <===';
    PRINT N'====================================================================';
    GO

    -- ============================================================================
    -- PHAN TRUY VAN MAU (boi den tung doan de chay thu)
    -- ============================================================================
    -- 1. Xem danh sach nhan vien:
    -- SELECT * FROM dbo.VW_DanhSachNhanVien;
    -- 2. Xem bang cham cong thang:
    -- SELECT * FROM dbo.VW_ChamCongThang;
    -- 3. Xem bang luong chi tiet:
    -- SELECT * FROM dbo.VW_BangLuongChiTiet;
    -- 4. Xem board Kanban:
    -- SELECT * FROM dbo.VW_BoardKanban ORDER BY TrangThai, ViTri;
