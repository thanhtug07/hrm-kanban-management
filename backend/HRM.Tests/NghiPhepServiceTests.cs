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
}
