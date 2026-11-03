using System.Security.Claims;
using HRM.Application.Services;
using HRM.Core.DTOs.NghiPhep;
using HRM.Core.Entities;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace HRM.Tests;

/// <summary>
/// Unit test cho NghiPhepService — tập trung vào logic overlap (bug từng gặp)
/// và quy tắc duyệt đơn.
///
/// GIỚI HẠN CỦA InMemory (EF Core InMemory) — ĐỌC TRƯỚC KHI TIN VÀO FILE NÀY:
///  1. KHÔNG thực thi trigger TR_NghiPhep_Update (duyệt đơn -> sinh bản ghi ChamCong,
///     bỏ Thứ 7/Chủ nhật). Test ở đây KHÔNG kiểm chứng được việc sinh chấm công.
///  2. KHÔNG thực thi stored procedure SP_TinhLuongThang.
///  3. KHÔNG thực thi UNIQUE constraint (nếu có) và không có lock/transaction thật
///     -> nhánh chống race TOCTOU của CreateAsync không test được.
///  Các phần cần SQL Server thật: xem PayrollSqlIntegrationTests.cs (Skip mặc định).
/// </summary>
public class NghiPhepServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static ClaimsPrincipal UserWith(string maNV, string role = "NhanVien")
    {
        var claims = new List<Claim>
        {
            new("MaNV", maNV),
            new(ClaimTypes.Role, role)
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
    }

    private static async Task SeedNhanVien(AppDbContext ctx, string maNV)
    {
        ctx.PhongBans.Add(new PhongBan { MaPB = "PB001", TenPB = "CNTT" });
        ctx.ChucVus.Add(new ChucVu { MaCV = "CV001", TenCV = "NV", LuongCoBan = 1000 });
        ctx.NhanViens.Add(new NhanVien
        {
            MaNV = maNV, HoTen = "Test " + maNV, GioiTinh = "Nam",
            NgaySinh = new DateOnly(1990, 1, 1), CCCD = "000000000001",
            MaPB = "PB001", MaCV = "CV001", NgayVaoLam = new DateOnly(2020, 1, 1),
            TrangThai = "Đang làm"
        });
        await ctx.SaveChangesAsync();
    }

    [Fact]
    public async Task CreateAsync_TuNgayQuaKhu_TraVeThatBai()
    {
        using var ctx = CreateContext();
        await SeedNhanVien(ctx, "NV001");
        var svc = new NghiPhepService(ctx, NullLogger<NghiPhepService>.Instance);
        var user = UserWith("NV001");

        var dto = new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm",
            TuNgay = DateOnly.FromDateTime(DateTime.Today).AddDays(-5),
            DenNgay = DateOnly.FromDateTime(DateTime.Today).AddDays(-4)
        };

        var res = await svc.CreateAsync(dto, user);
        Assert.False(res.Success);
        // Khẳng định LÝ DO cụ thể, tránh việc một lỗi khác (vd trùng ngày) cũng làm Success=false.
        Assert.Contains("quá khứ", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_DonBaoTromDonCu_TraVeThatBai()
    {
        // Bug đã fix: đơn mới bao trùm đơn cũ phải bị phát hiện trùng
        using var ctx = CreateContext();
        await SeedNhanVien(ctx, "NV001");

        var baseDate = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        ctx.NghiPheps.Add(new NghiPhep
        {
            MaNV = "NV001", LoaiPhep = "Phép năm",
            TuNgay = baseDate, DenNgay = baseDate.AddDays(2), // 10-12
            TrangThai = "Chờ duyệt"
        });
        await ctx.SaveChangesAsync();

        var svc = new NghiPhepService(ctx, NullLogger<NghiPhepService>.Instance);
        var user = UserWith("NV001");

        // Đơn mới 8-15 BAO TRÙM đơn 10-12 -> phải bị chặn
        var dto = new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm",
            TuNgay = baseDate.AddDays(-2),
            DenNgay = baseDate.AddDays(5)
        };

        var res = await svc.CreateAsync(dto, user);
        Assert.False(res.Success);
        Assert.Contains("trùng", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_DonKhongTrung_TraVeThanhCong()
    {
        using var ctx = CreateContext();
        await SeedNhanVien(ctx, "NV001");

        var baseDate = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        ctx.NghiPheps.Add(new NghiPhep
        {
            MaNV = "NV001", LoaiPhep = "Phép năm",
            TuNgay = baseDate, DenNgay = baseDate.AddDays(2),
            TrangThai = "Chờ duyệt"
        });
        await ctx.SaveChangesAsync();

        var svc = new NghiPhepService(ctx, NullLogger<NghiPhepService>.Instance);
        var user = UserWith("NV001");

        // Đơn mới 20-22, không trùng 10-12
        var dto = new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm",
            TuNgay = baseDate.AddDays(10),
            DenNgay = baseDate.AddDays(12)
        };

        var res = await svc.CreateAsync(dto, user);
        Assert.True(res.Success);
    }

    [Fact]
    public async Task DuyetAsync_TuDuyetDonChinhMinh_TraVeThatBai()
    {
        using var ctx = CreateContext();
        await SeedNhanVien(ctx, "NV001");
        ctx.NghiPheps.Add(new NghiPhep
        {
            MaNV = "NV001", LoaiPhep = "Phép năm",
            TuNgay = DateOnly.FromDateTime(DateTime.Today),
            DenNgay = DateOnly.FromDateTime(DateTime.Today).AddDays(1),
            TrangThai = "Chờ duyệt"
        });
        await ctx.SaveChangesAsync();
        var don = await ctx.NghiPheps.FirstAsync();

        var svc = new NghiPhepService(ctx, NullLogger<NghiPhepService>.Instance);
        // HR chính là NV001 (tự duyệt đơn mình)
        var user = UserWith("NV001", "HR");
        var res = await svc.DuyetAsync(don.MaNP, new DuyetNghiPhepDto { TrangThai = "Đã duyệt" }, user);

        Assert.False(res.Success);
    }

    // ===== Boundary overlap: predicate là (dto.TuNgay <= n.DenNgay && dto.DenNgay >= n.TuNgay) =====
    // Hai khoảng [a,b] và [c,d] bị coi là trùng khi CHÚNG GIAO NHAU (kể cả chỉ chung 1 ngày).

    private static async Task<(AppDbContext ctx, NghiPhepService svc, ClaimsPrincipal user)> SetupWithExisting(
        DateOnly tuNgay, DateOnly denNgay, string trangThai = "Chờ duyệt")
    {
        var ctx = CreateContext();
        await SeedNhanVien(ctx, "NV001");
        ctx.NghiPheps.Add(new NghiPhep
        {
            MaNV = "NV001", LoaiPhep = "Phép năm",
            TuNgay = tuNgay, DenNgay = denNgay, TrangThai = trangThai
        });
        await ctx.SaveChangesAsync();
        return (ctx, new NghiPhepService(ctx, NullLogger<NghiPhepService>.Instance), UserWith("NV001"));
    }

    [Fact]
    public async Task CreateAsync_CungNgayBatDau_BiChan()
    {
        // Đơn cũ 10-12, đơn mới 10-14 (cùng TừNgay)
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(2));
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b, DenNgay = b.AddDays(4)
        }, user);

        Assert.False(res.Success);
        Assert.Contains("trùng", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_CungNgayKetThuc_BiChan()
    {
        // Đơn cũ 10-12, đơn mới 8-12 (cùng ĐếnNgày)
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(2));
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b.AddDays(-2), DenNgay = b.AddDays(2)
        }, user);

        Assert.False(res.Success);
        Assert.Contains("trùng", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_KeNhauChungMotNgay_BiChan()
    {
        // Đơn cũ 10-12, đơn mới 12-13: chung ngày 12 -> PHẢI bị chặn.
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(2));
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b.AddDays(2), DenNgay = b.AddDays(3)
        }, user);

        Assert.False(res.Success);
        Assert.Contains("trùng", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_NamHoanToanTrongKhoangCu_BiChan()
    {
        // Đơn cũ 10-20, đơn mới 12-14 (nằm gọn bên trong)
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(10));
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b.AddDays(2), DenNgay = b.AddDays(4)
        }, user);

        Assert.False(res.Success);
        Assert.Contains("trùng", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAsync_LienKeKhongChungNgay_ThanhCong()
    {
        // Đơn cũ 10-12, đơn mới 13-14: KHÔNG chung ngày -> phải cho qua.
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(2));
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b.AddDays(3), DenNgay = b.AddDays(4)
        }, user);

        Assert.True(res.Success);
    }

    [Fact]
    public async Task CreateAsync_DonCuDaTuChoi_KhongChanDonMoi()
    {
        // Đơn cũ 10-12 nhưng Trạng thái = "Từ chối" -> KHÔNG được chặn đơn mới trùng.
        var b = DateOnly.FromDateTime(DateTime.Today).AddDays(10);
        var (ctx, svc, user) = await SetupWithExisting(b, b.AddDays(2), trangThai: "Từ chối");
        using var _ = ctx;

        var res = await svc.CreateAsync(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm", TuNgay = b, DenNgay = b.AddDays(2)
        }, user);

        Assert.True(res.Success);
    }
}
