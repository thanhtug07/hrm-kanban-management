using HRM.Core.Entities;
using HRM.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HRM.Tests;

/// <summary>
/// INTEGRATION TEST CẦN SQL SERVER THẬT — MẶC ĐỊNH BỊ SKIP.
///
/// Lý do tồn tại: EF Core InMemory KHÔNG thực thi trigger, stored procedure hay
/// UNIQUE constraint, nên các hành vi sau KHÔNG THỂ test bằng InMemory:
///   - SP_TinhLuongThang: tính lương tháng (phụ cấp, khấu trừ, số ngày công).
///   - TR_NghiPhep_Update: duyệt đơn nghỉ -> tự sinh bản ghi ChamCong, BỎ Thứ 7/Chủ nhật.
///   - UNIQUE(MaNV, Ngay) trên ChamCong.
///
/// CÁCH CHẠY:
///   1. Có SQL Server (LocalDB hoặc instance) và file QUANLYNHANSU.sql ở gốc repo.
///   2. Đặt biến môi trường HRM_SQL_TEST=1
///      (tùy chọn: HRM_SQL_CONNSTR để trỏ instance; mặc định (localdb)\MSSQLLocalDB).
///   3. dotnet test --filter "FullyQualifiedName~PayrollSqlIntegrationTests"
///
/// AN TOÀN DỮ LIỆU: mỗi test tạo một database tạm tên duy nhất (HRM_Test_&lt;guid&gt;),
/// nạp schema từ QUANLYNHANSU.sql (chỉ đổi tên DB), chạy, rồi DROP. KHÔNG đụng
/// database QUANLYNHANSU của ứng dụng.
/// </summary>
[Trait("Category", "SqlIntegration")]
public class PayrollSqlIntegrationTests
{
    /// <summary>
    /// Fact chỉ chạy khi HRM_SQL_TEST=1, ngược lại hiển thị rõ "Skipped" (không phải pass giả).
    /// </summary>
    public sealed class SqlFactAttribute : FactAttribute
    {
        public SqlFactAttribute()
        {
            if (Environment.GetEnvironmentVariable("HRM_SQL_TEST") != "1")
                Skip = SkipReason;
        }
    }

    private const string SkipReason =
        "Cần SQL Server thật. Đặt HRM_SQL_TEST=1 và đảm bảo QUANLYNHANSU.sql có ở gốc repo. " +
        "Không chạy được bằng InMemory (cần trigger/SP/UNIQUE).";

    private static string MasterConnStr =>
        Environment.GetEnvironmentVariable("HRM_SQL_CONNSTR")
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=master;Trusted_Connection=True;TrustServerCertificate=True;";

    /// <summary>Tìm file QUANLYNHANSU.sql ở gốc repo (đi ngược từ thư mục test).</summary>
    private static string FindSchemaScript()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null)
        {
            var candidate = Path.Combine(dir.FullName, "QUANLYNHANSU.sql");
            if (File.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }
        throw new FileNotFoundException("Không tìm thấy QUANLYNHANSU.sql ở gốc repo.");
    }

    /// <summary>Tạo DB tạm + nạp schema. Trả về connection string trỏ DB tạm.</summary>
    private static async Task<(string connStr, string dbName)> CreateTempDbAsync()
    {
        var dbName = "HRM_Test_" + Guid.NewGuid().ToString("N");
        var script = await File.ReadAllTextAsync(FindSchemaScript());
        // Chỉ đổi 3 chỗ tham chiếu tên DB tạm; phần còn lại của script giữ nguyên.
        script = script
            .Replace("N'QUANLYNHANSU'", $"N'{dbName}'")
            .Replace("CREATE DATABASE QUANLYNHANSU", $"CREATE DATABASE [{dbName}]")
            .Replace("USE QUANLYNHANSU;", $"USE [{dbName}];");

        await using (var master = new SqlConnection(MasterConnStr))
        {
            await master.OpenAsync();
            // SqlClient không chạy multi-batch trong 1 command; tách theo GO.
            foreach (var batch in SplitOnGo(script))
            {
                if (string.IsNullOrWhiteSpace(batch)) continue;
                await using var cmd = new SqlCommand(batch, master) { CommandTimeout = 120 };
                await cmd.ExecuteNonQueryAsync();
            }
        }

        var builder = new SqlConnectionStringBuilder(MasterConnStr) { InitialCatalog = dbName };
        return (builder.ConnectionString, dbName);
    }

    private static async Task DropTempDbAsync(string dbName)
    {
        await using var master = new SqlConnection(MasterConnStr);
        await master.OpenAsync();
        var sql = $@"IF DB_ID(N'{dbName}') IS NOT NULL
                     BEGIN
                         ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                         DROP DATABASE [{dbName}];
                     END";
        await using var cmd = new SqlCommand(sql, master) { CommandTimeout = 120 };
        await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>Tách script SQL theo dòng chỉ chứa GO (bỏ qua GO trong comment/chuỗi — đủ dùng cho file này).</summary>
    private static IEnumerable<string> SplitOnGo(string script)
    {
        var lines = script.Replace("\r\n", "\n").Split('\n');
        var buffer = new List<string>();
        foreach (var line in lines)
        {
            if (line.Trim().Equals("GO", StringComparison.OrdinalIgnoreCase))
            {
                yield return string.Join('\n', buffer);
                buffer.Clear();
            }
            else
            {
                buffer.Add(line);
            }
        }
        if (buffer.Count > 0) yield return string.Join('\n', buffer);
    }

    private static AppDbContext ContextFor(string connStr)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connStr)
            .Options;
        return new AppDbContext(options);
    }

    // ===== SP_TinhLuongThang =====

    // BUG ĐÃ PHÁT HIỆN (test này chạy thật với SQL Server):
    //   SP_TinhLuongThang tính LuongCoBan = CAST(FLOOR((LuongCoBan/22.0)*SoNgayCong + 0.5) AS DECIMAL(18,2)),
    //   tức làm tròn nửa lên đúng chuẩn kế toán VN (SQL Server ROUND mặc định là half-to-even).
    //   Trước đây SP dùng CAST(ROUND(x,0) + 0.5 AS DECIMAL(18,0)) khiến kết quả luôn bị +1 đồng (bug đã sửa).
    [SqlFact]
    public async Task SP_TinhLuongThang_TinhDungPhuCapKhauTruVaSoNgayCong()
    {
        var (connStr, dbName) = await CreateTempDbAsync();
        try
        {
            await using var ctx = ContextFor(connStr);

            // Seed: 1 phòng ban, 1 chức vụ lương 22 triệu, 1 nhân viên đang làm, 1 trưởng phòng (để FK PhongBan hợp lệ).
            await ctx.Database.ExecuteSqlRawAsync(@"
                INSERT INTO dbo.PhongBan (MaPB, TenPB, MaNV_QL) VALUES ('PB001', N'CNTT', NULL);
                INSERT INTO dbo.ChucVu (MaCV, TenCV, LuongCoBan) VALUES ('CV001', N'Nhân viên', 22000000);
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV001', N'Nguyễn Văn A', N'Nam', '1990-01-01', '000000000001', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
            ");

            // 22 ngày công đủ + 2 ngày trễ trong tháng 6/2026.
            var chamCongSql = new System.Text.StringBuilder(
                "INSERT INTO dbo.ChamCong (MaNV, Ngay, GioVao, GioRa, TrangThai) VALUES ");
            var rows = new List<string>();
            for (int d = 1; d <= 22; d++)
                rows.Add($"('NV001', DATEFROMPARTS(2026,6,{d}), '08:00', '17:30', N'Đủ công')");
            rows.Add("('NV001', DATEFROMPARTS(2026,6,23), '08:30', '17:30', N'Trễ')");
            rows.Add("('NV001', DATEFROMPARTS(2026,6,24), '08:30', '17:30', N'Trễ')");
            chamCongSql.Append(string.Join(",", rows)).Append(';');
            await ctx.Database.ExecuteSqlRawAsync(chamCongSql.ToString());

            // Thưởng 2.000.000 (Thưởng) + phạt 500.000 (Phạt) trong cùng kỳ.
            await ctx.Database.ExecuteSqlRawAsync(@"
                INSERT INTO dbo.ChiPhiPhatSinh (MaNV, Loai, SoTien, Thang, Nam)
                    VALUES ('NV001', N'Thưởng', 2000000, 6, 2026),
                           ('NV001', N'Phạt',   500000, 6, 2026);
            ");

            // Chạy SP.
            await ctx.Database.ExecuteSqlRawAsync("EXEC dbo.SP_TinhLuongThang @Thang = 6, @Nam = 2026;");

            var bl = await ctx.BangLuongs.AsNoTracking().SingleAsync(b => b.MaNV == "NV001" && b.Thang == 6 && b.Nam == 2026);

            // LuongCoBan = ROUND(22000000/22*22, 0)+0.5 = 22000000 (làm tròn nửa lên).
            Assert.Equal(22000000m, bl.LuongCoBan);
            Assert.Equal(22, bl.SoNgayCong);
            // PhuCap = 500000 + 2000000 = 2500000
            Assert.Equal(2500000m, bl.PhuCap);
            // KhauTru = 2 * 50000 + 500000 = 600000
            Assert.Equal(600000m, bl.KhauTru);
        }
        finally { await DropTempDbAsync(dbName); }
    }

    [SqlFact]
    public async Task SP_TinhLuongThang_ChayLai_KhongNhanDoiDuLieu()
    {
        var (connStr, dbName) = await CreateTempDbAsync();
        try
        {
            await using var ctx = ContextFor(connStr);
            await ctx.Database.ExecuteSqlRawAsync(@"
                INSERT INTO dbo.PhongBan (MaPB, TenPB, MaNV_QL) VALUES ('PB001', N'CNTT', NULL);
                INSERT INTO dbo.ChucVu (MaCV, TenCV, LuongCoBan) VALUES ('CV001', N'Nhân viên', 8000000);
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV001', N'Nguyễn Văn A', N'Nam', '1990-01-01', '000000000001', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
            ");

            await ctx.Database.ExecuteSqlRawAsync("EXEC dbo.SP_TinhLuongThang @Thang = 6, @Nam = 2026;");
            await ctx.Database.ExecuteSqlRawAsync("EXEC dbo.SP_TinhLuongThang @Thang = 6, @Nam = 2026;");

            // SP là idempotent cho một kỳ: DELETE rồi INSERT -> phải còn đúng 1 dòng.
            var count = await ctx.BangLuongs.CountAsync(b => b.MaNV == "NV001" && b.Thang == 6 && b.Nam == 2026);
            Assert.Equal(1, count);
        }
        finally { await DropTempDbAsync(dbName); }
    }

    [SqlFact]
    public async Task SP_TinhLuongThang_ThangKhongHopLe_NemLoi()
    {
        var (connStr, dbName) = await CreateTempDbAsync();
        try
        {
            await using var ctx = ContextFor(connStr);
            await Assert.ThrowsAnyAsync<Exception>(() =>
                ctx.Database.ExecuteSqlRawAsync("EXEC dbo.SP_TinhLuongThang @Thang = 13, @Nam = 2026;"));
        }
        finally { await DropTempDbAsync(dbName); }
    }

    // ===== TR_NghiPhep_Update =====

    [SqlFact]
    public async Task Trigger_DuyetNghiPhep_SinhChamCongBoQuaCuoiTuan()
    {
        var (connStr, dbName) = await CreateTempDbAsync();
        try
        {
            await using var ctx = ContextFor(connStr);
            await ctx.Database.ExecuteSqlRawAsync(@"
                INSERT INTO dbo.PhongBan (MaPB, TenPB, MaNV_QL) VALUES ('PB001', N'CNTT', NULL);
                INSERT INTO dbo.ChucVu (MaCV, TenCV, LuongCoBan) VALUES ('CV001', N'Nhân viên', 8000000);
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV001', N'Nguyễn Văn A', N'Nam', '1990-01-01', '000000000001', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV002', N'Trần Thị B', N'Nữ', '1992-02-02', '000000000002', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
            ");

            // Chọn 1 tuần đầy đủ Thứ 2 -> Chủ nhật bắt đầu từ một Thứ Hai cố định.
            var monday = new DateOnly(2026, 6, 1); // 2026-06-01 là Thứ Hai
            var sunday = monday.AddDays(6);
            Assert.Equal(DayOfWeek.Monday, monday.DayOfWeek);

            await ctx.Database.ExecuteSqlRawAsync(
                "INSERT INTO dbo.NghiPhep (MaNV, LoaiPhep, TuNgay, DenNgay, TrangThai, MaNV_Duyet) " +
                "VALUES ('NV001', N'Phép năm', {0}, {1}, N'Chờ duyệt', NULL);",
                monday.ToDateTime(TimeOnly.MinValue), sunday.ToDateTime(TimeOnly.MinValue));

            // Duyệt đơn -> trigger sinh chấm công cho các ngày trong tuần (bỏ T7, CN).
            await ctx.Database.ExecuteSqlRawAsync(
                "UPDATE dbo.NghiPhep SET TrangThai = N'Đã duyệt', MaNV_Duyet = 'NV002' WHERE MaNV = 'NV001';");

            var rows = await ctx.ChamCongs.AsNoTracking()
                .Where(c => c.MaNV == "NV001")
                .OrderBy(c => c.Ngay)
                .ToListAsync();

            // Thứ 2->Thứ 6 = 5 ngày; Thứ 7 + Chủ nhật bị loại.
            Assert.Equal(5, rows.Count);
            Assert.All(rows, r => Assert.Equal("Nghỉ phép", r.TrangThai));
            Assert.DoesNotContain(rows, r => r.Ngay.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday);
            Assert.Equal(monday, rows.First().Ngay);
            Assert.Equal(monday.AddDays(4), rows.Last().Ngay); // Thứ 6
        }
        finally { await DropTempDbAsync(dbName); }
    }

    [SqlFact]
    public async Task Trigger_ChuyenTuChoiSangDaDuyetMoiSinh()
    {
        var (connStr, dbName) = await CreateTempDbAsync();
        try
        {
            await using var ctx = ContextFor(connStr);
            await ctx.Database.ExecuteSqlRawAsync(@"
                INSERT INTO dbo.PhongBan (MaPB, TenPB, MaNV_QL) VALUES ('PB001', N'CNTT', NULL);
                INSERT INTO dbo.ChucVu (MaCV, TenCV, LuongCoBan) VALUES ('CV001', N'Nhân viên', 8000000);
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV001', N'Nguyễn Văn A', N'Nam', '1990-01-01', '000000000001', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
                INSERT INTO dbo.NhanVien (MaNV, HoTen, GioiTinh, NgaySinh, CCCD, MaPB, MaCV, NgayVaoLam, TrangThai)
                    VALUES ('NV002', N'Trần Thị B', N'Nữ', '1992-02-02', '000000000002', 'PB001', 'CV001', '2020-01-01', N'Đang làm');
                INSERT INTO dbo.NghiPhep (MaNV, LoaiPhep, TuNgay, DenNgay, TrangThai, MaNV_Duyet)
                    VALUES ('NV001', N'Phép năm', '2026-06-01', '2026-06-03', N'Từ chối', 'NV002');
            ");

            // Từ chối -> Đã duyệt: trigger điều kiện d.TrangThai <> 'Đã duyệt' nên PHẢI sinh.
            await ctx.Database.ExecuteSqlRawAsync(
                "UPDATE dbo.NghiPhep SET TrangThai = N'Đã duyệt' WHERE MaNV = 'NV001';");

            var count = await ctx.ChamCongs.CountAsync(c => c.MaNV == "NV001" && c.TrangThai == "Nghỉ phép");
            // 1,2,3/6/2026 là Thứ 2,3,4 -> đều ngày trong tuần -> 3 dòng.
            Assert.Equal(3, count);
        }
        finally { await DropTempDbAsync(dbName); }
    }
}
