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
            CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN (N'Admin', N'HR', N'NhanVien')),
            CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNV) REFERENCES dbo.NhanVien(MaNV) ON DELETE SET NULL
        );
    END
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
    PRINT N'BẮT ĐẦU NẠP DỮ LIỆU MẪU CHUẨN UNICODE (TIẾNG VIỆT)...';
    PRINT N'====================================================================';

    -- 5.1. Nạp Phòng ban
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

    -- 5.2. Nạp Chức vụ
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

    -- 5.3. Nạp Nhân viên
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
        ('NV020', N'Vương Bảo Trâm', N'Nữ', '1992-12-30', '001092001234', '0901234569', 'tram.vb@company.com', N'Hà Nội', 'PB002', 'CV004', '2021-11-01', N'Nghỉ việc')
    ) AS source (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
    ON target.MaNV = source.MaNV
    WHEN NOT MATCHED THEN
        INSERT (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, SDT, Email, DiaChi, MaPB, MaCV, NgayVaoLam, TrangThai)
        VALUES (source.MaNV, source.HoTen, source.GioiTinh, source.NgaySinh, source.CCCD, source.SDT, source.Email, source.DiaChi, source.MaPB, source.MaCV, source.NgayVaoLam, source.TrangThai);
    GO

    -- Cập nhật trưởng phòng
    UPDATE dbo.PhongBan SET MaNV_QL = 'NV001' WHERE MaPB = 'PB001';
    UPDATE dbo.PhongBan SET MaNV_QL = 'NV002' WHERE MaPB = 'PB002';
    UPDATE dbo.PhongBan SET MaNV_QL = 'NV003' WHERE MaPB = 'PB003';
    UPDATE dbo.PhongBan SET MaNV_QL = 'NV004' WHERE MaPB = 'PB004';
    UPDATE dbo.PhongBan SET MaNV_QL = 'NV005' WHERE MaPB = 'PB005';
    GO

    -- 5.4. Nạp Tài khoản (Admin, HR, NhanVien)
    MERGE INTO dbo.TaiKhoan AS target
    USING (VALUES
        ('admin', '$2a$11$25EBmDhZ2KvKtoeLaNdZpePVlZX.0214oTWBnBhdGBl.l0y59dDGS', N'Admin',    'NV000', 1),
        ('hr01',  '$2a$11$ZbOXYsdJoZSC/.7xlxTNDef02SgNrBjS0lAozqVIcGCD9Ste8Cn/S', N'HR',       'NV002', 1),
        ('hr02',  '$2a$11$5p51Wi1CqP0XuoeS1dCRueIcJGVQhjdRLmo3NjiB90YefMO.FwO3m', N'HR',       'NV010', 1),
        ('nv001', '$2a$11$fCjjPd0/hu4XYOjdSAdI5Os9Fn/UZXD3S4izg7Xd8WpCnQjM2b7Ra', N'NhanVien', 'NV006', 1),
        ('nv002', '$2a$11$WsMbIuPJvOmvLDQUhVyQeeno9wI84Ne0OaZkP5IU3KY8teb.UZU6G', N'NhanVien', 'NV007', 1)
    ) AS source (TenDangNhap, MatKhauHash, VaiTro, MaNV, TrangThai)
    ON target.TenDangNhap = source.TenDangNhap
    WHEN MATCHED THEN
        UPDATE SET target.MatKhauHash = source.MatKhauHash, target.MaNV = source.MaNV, target.VaiTro = source.VaiTro
    WHEN NOT MATCHED THEN
        INSERT (TenDangNhap, MatKhauHash, VaiTro, MaNV, TrangThai)
        VALUES (source.TenDangNhap, source.MatKhauHash, source.VaiTro, source.MaNV, source.TrangThai);
    GO

    -- 5.5. Nạp Hợp đồng
    MERGE INTO dbo.HopDong AS target
    USING (VALUES
        ('HD0001', 'NV001', N'Chính thức', '2020-02-01', '2025-02-01', 25000000.00, N'Hiệu lực'),
        ('HD0002', 'NV002', N'Chính thức', '2020-02-15', '2025-02-15', 25000000.00, N'Hiệu lực'),
        ('HD0003', 'NV003', N'Chính thức', '2020-03-01', '2025-03-01', 25000000.00, N'Hiệu lực'),
        ('HD0004', 'NV006', N'Chính thức', '2021-01-10', '2024-01-10', 18000000.00, N'Hiệu lực'),
        ('HD0005', 'NV007', N'Chính thức', '2021-05-15', '2024-05-15', 12000000.00, N'Hiệu lực'),
        ('HD0006', 'NV008', N'Thử việc',   '2024-09-01', '2024-11-01', 10000000.00, N'Hiệu lực'),
        ('HD0007', 'NV009', N'Thời vụ',    '2024-08-01', '2024-12-31', 4000000.00,  N'Hiệu lực'),
        ('HD0008', 'NV020', N'Chính thức', '2021-11-01', '2023-11-01', 12000000.00, N'Hết hạn')
    ) AS source (MaHD, MaNV, LoaiHD, NgayBatDau, NgayKetThuc, LuongThoaThuan, TrangThai)
    ON target.MaHD = source.MaHD
    WHEN NOT MATCHED THEN
        INSERT (MaHD, MaNV, LoaiHD, NgayBatDau, NgayKetThuc, LuongThoaThuan, TrangThai)
        VALUES (source.MaHD, source.MaNV, source.LoaiHD, source.NgayBatDau, source.NgayKetThuc, source.LuongThoaThuan, source.TrangThai);
    GO

    -- 5.6. Nạp Chấm công (20 ngày tháng 10/2026)
    DECLARE @Day INT = 1;
    WHILE @Day <= 20
    BEGIN
        DECLARE @CurDate DATE = DATEFROMPARTS(2026, 10, @Day);
        IF ((DATEPART(dw, @CurDate) + @@DATEFIRST - 1) % 7) NOT IN (0, 6)
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
                    ELSE N'Đủ công'
                END
            FROM dbo.NhanVien nv
            WHERE nv.TrangThai = N'Đang làm'
            AND NOT EXISTS (SELECT 1 FROM dbo.ChamCong WHERE MaNV = nv.MaNV AND Ngay = @CurDate);
        END
        SET @Day = @Day + 1;
    END;
    GO

    -- 5.7. Nạp Nghỉ phép
    IF NOT EXISTS (SELECT 1 FROM dbo.NghiPhep)
    BEGIN
        INSERT INTO dbo.NghiPhep (MaNV, LoaiPhep, TuNgay, DenNgay, LyDo, TrangThai, MaNV_Duyet, NgayDuyet)
        VALUES 
        ('NV006', N'Phép năm', '2026-10-15', '2026-10-16', N'Gia đình có việc hiếu hỉ', N'Đã duyệt', 'NV002', '2026-10-14 09:30:00'),
        ('NV007', N'Bệnh', '2026-10-20', '2026-10-21', N'Sốt cấp tính có giấy khám bác sĩ', N'Đã duyệt', 'NV002', '2026-10-19 14:00:00'),
        ('NV008', N'Phép năm', '2026-10-25', '2026-10-26', N'Nghỉ ngơi cùng người thân', N'Chờ duyệt', NULL, NULL),
        ('NV011', N'Không lương', '2026-10-05', '2026-10-07', N'Việc cá nhân đột xuất', N'Từ chối', 'NV002', '2026-10-04 16:20:00');
    END
    GO

    -- 5.8. Tính lương tự động bằng SP_TinhLuongThang
    EXEC dbo.SP_TinhLuongThang @Thang = 10, @Nam = 2026;
    GO

    -- 5.9. Nạp Công việc Kanban (13 task mẫu, 4 cột)
    IF NOT EXISTS (SELECT 1 FROM dbo.CongViec)
    BEGIN
        INSERT INTO dbo.CongViec (TieuDe, MoTa, MaNV_PhuTrach, MaNV_Giao, TrangThai, ViTri, DoUuTien, NgayBatDau, Deadline, NgayHoanThanh)
        VALUES 
        -- CỘT TODO
        (N'Nghiên cứu kiến trúc Microservices', N'Đánh giá khả năng mở rộng hệ thống cho quý 1 năm sau', 'NV006', 'NV001', N'Todo', 1000, N'Cao', '2026-10-24', '2026-11-05', NULL),
        (N'Chuẩn bị hồ sơ tuyển dụng đợt tháng 11', N'Lên JD cho 3 vị trí Frontend Developer và 2 Tester', 'NV010', 'NV002', N'Todo', 2000, N'Trung bình', '2026-10-25', '2026-11-01', NULL),
        (N'Kiểm kê tài sản thiết bị văn phòng', N'Rà soát laptop, máy in và trang thiết bị các tầng', 'NV011', 'NV002', N'Todo', 3000, N'Thấp', '2026-10-26', '2026-11-10', NULL),
        (N'Lập báo cáo tài chính dự trù quý 4', N'Tổng hợp doanh thu và chi phí lương các phòng ban', 'NV012', 'NV003', N'Todo', 4000, N'Khẩn cấp', '2026-10-20', '2026-10-31', NULL),
        (N'Xây dựng chiến dịch quảng cáo TikTok', N'Thiết kế chuỗi video ngắn quảng bá văn hóa doanh nghiệp', 'NV017', 'NV005', N'Todo', 5000, N'Trung bình', '2026-10-24', '2026-11-15', NULL),

        -- CỘT INPROGRESS
        (N'Thiết kế CSDL SQL Server và viết Stored Procedures', N'Thiết kế 11 bảng chuẩn 3NF và viết SP di chuyển task gap-based', 'NV006', 'NV001', N'InProgress', 1000, N'Khẩn cấp', '2026-10-15', '2026-10-23', NULL),
        (N'Gặp gỡ khách hàng ký hợp đồng phần mềm ERP', N'Thương thảo điều khoản bảo hành và thanh toán theo mốc dự án', 'NV014', 'NV004', N'InProgress', 2000, N'Khẩn cấp', '2026-10-22', '2026-10-26', NULL),

        -- CỘT REVIEW (KIỂM TRA / DUYỆT)
        (N'Phát triển API Xác thực JWT và phân quyền RBAC', N'Viết AuthController, PasswordHasher với BCrypt và JwtHelper', 'NV007', 'NV001', N'Review', 1000, N'Cao', '2026-10-18', '2026-10-28', NULL),
        (N'Xây dựng giao diện Kanban kéo thả bằng @hello-pangea/dnd', N'Hoàn thiện 4 cột, Drawer xem chi tiết và modal tạo task', 'NV008', 'NV001', N'Review', 2000, N'Cao', '2026-10-20', '2026-10-30', NULL),

        -- CỘT DONE
        (N'Họp khởi động dự án HRM và chốt phạm vi BTL', N'Thống nhất dùng .NET 8, React 19 và SQL Server 2022', 'NV006', 'NV001', N'Done', 1000, N'Khẩn cấp', '2026-10-01', '2026-10-05', '2026-10-04 17:00:00'),
        (N'Khảo sát yêu cầu bài toán quản lý nhân sự', N'Thu thập biểu mẫu chấm công, thang bảng lương và hợp đồng', 'NV007', 'NV002', N'Done', 2000, N'Cao', '2026-10-05', '2026-10-10', '2026-10-09 15:30:00'),
        (N'Cài đặt môi trường phát triển & Repository GitHub', N'Tạo repo git, mời các thành viên và cấu hình branch protection', 'NV008', 'NV001', N'Done', 3000, N'Trung bình', '2026-10-08', '2026-10-12', '2026-10-11 11:20:00'),
        (N'Duyệt kế hoạch ngân sách quý 3', N'Đã hoàn tất thanh quyết toán các khoản chi tiêu phòng ban', 'NV013', 'NV003', N'Done', 4000, N'Trung bình', '2026-10-01', '2026-10-10', '2026-10-08 09:45:00');
    END
    GO

    -- 5.10. Nạp Bình luận
    IF NOT EXISTS (SELECT 1 FROM dbo.BinhLuan)
    BEGIN
        INSERT INTO dbo.BinhLuan (MaTask, MaNV, NoiDung, ThoiGian)
        VALUES 
        (6, 'NV001', N'Task này sắp hết hạn rồi, Huy xem đẩy nhanh tiến độ nhé!', DATEADD(HOUR, -5, GETDATE())),
        (6, 'NV006', N'Em đang viết Stored Procedure SP_DiChuyenTask, tối nay sẽ test xong anh nhé.', DATEADD(HOUR, -3, GETDATE())),
        (7, 'NV001', N'Nhớ dùng BCrypt.Net-Next để hash mật khẩu an toàn.', DATEADD(HOUR, -8, GETDATE())),
        (8, 'NV007', N'Đã ghép xong phần kéo thả với Optimistic UI, rất mượt!', DATEADD(HOUR, -2, GETDATE()));
    END
    GO

    PRINT N'====================================================================';
    PRINT N'===> HOÀN TẤT THIẾT LẬP CƠ SỞ DỮ LIỆU QUANLYNHANSU THÀNH CÔNG 100%! <===';
    PRINT N'====================================================================';
    GO

    -- ============================================================================
    -- PHẦN TRUY VẤN MẪU (BẠN CÓ THỂ BÔI ĐEN TỪNG ĐOẠN ĐỂ CHẠY THỬ VÀ DEMO)
    -- ============================================================================

    -- 1. Xem dữ liệu Board Kanban (1 query load trọn vẹn số comment và cờ quá hạn):
    -- SELECT * FROM dbo.VW_BoardKanban ORDER BY TrangThai, ViTri;

    -- 2. Xem các công việc quá hạn:
    -- SELECT * FROM dbo.VW_TaskQuaHan;

    -- 3. Xem bảng lương chi tiết tháng:
    -- SELECT * FROM dbo.VW_BangLuongChiTiet WHERE Thang = 10 AND Nam = 2026;

    -- 4. Thử nghiệm di chuyển task Kanban (Gap-based):
    -- EXEC dbo.SP_DiChuyenTask @MaTask = 1, @TrangThaiMoi = N'InProgress', @ViTriMoi = 1500;
