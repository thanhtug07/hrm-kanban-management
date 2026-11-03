using System.Security.Claims;
using HRM.Application.Services;
using HRM.Core.Entities;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace HRM.Tests;

/// <summary>
/// Unit test cho ChamCongService (check-in / check-out).
///
/// GIỚI HẠN CỦA InMemory — ĐỌC TRƯỚC KHI TIN VÀO FILE NÀY:
///  1. InMemory KHÔNG thực thi UNIQUE(MaNV, Ngay) -> nhánh bắt DbUpdateException
///     (race 2 request cùng ngày) KHÔNG thể test ở đây. Cần SQL Server thật.
///  2. InMemory KHÔNG chạy trigger TR_NghiPhep_Update (đồng bộ ngày nghỉ -> chấm công).
///  3. InMemory KHÔNG chạy stored procedure SP_TinhLuongThang.
///  Các phần trên xem thêm ở PayrollSqlIntegrationTests.cs (Skip mặc định).
///
/// GIỚI HẠN KHÁC: CheckInAsync/CheckOutAsync đọc DateTime.Now trực tiếp (không inject clock).
/// Test chỉ có thể cấu hình khung giờ sao cho kết quả LUÔN đúng bất kể giờ chạy test.
/// </summary>
public class ChamCongServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static ClaimsPrincipal UserWith(string? maNV)
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "NhanVien") };
        if (maNV != null) claims.Add(new Claim("MaNV", maNV));
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
    }

    private static ChamCongService NewService(AppDbContext ctx) =>
        new(ctx, NullLogger<ChamCongService>.Instance);

    /// <summary>Seed 1 cấu hình chấm công duy nhất (GetCauHinhAsync lấy FirstOrDefault).</summary>
    private static async Task SeedConfig(AppDbContext ctx, TimeOnly batDau, TimeOnly ketThuc,
        int phutSom = 0, int phutTre = 0, bool batBuocCheckOutSauKetThuc = false)
    {
        ctx.CauHinhChamCongs.Add(new CauHinhChamCong
        {
            GioBatDau = batDau,
            GioKetThuc = ketThuc,
            PhutChoPhepSom = phutSom,
            PhutChoPhepTre = phutTre,
            BatBuocCheckOutSauKetThuc = batBuocCheckOutSauKetThuc
        });
        await ctx.SaveChangesAsync();
    }

    // ===== missing MaNV claim =====

    [Fact]
    public async Task CheckIn_ThieuClaimMaNV_TraVeThatBai()
    {
        using var ctx = CreateContext();
        var res = await NewService(ctx).CheckInAsync(UserWith(null));
        Assert.False(res.Success);
        Assert.Contains("mã nhân viên", res.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(ctx.ChamCongs); // không tạo bản ghi rác
    }

    [Fact]
    public async Task CheckOut_ThieuClaimMaNV_TraVeThatBai()
    {
        using var ctx = CreateContext();
        var res = await NewService(ctx).CheckOutAsync(UserWith(null));
        Assert.False(res.Success);
    }

    // ===== check-in: khung giờ LUÔN mở =====

    [Fact]
    public async Task CheckIn_KhungGioLuonMo_TaoBanGhiVaChapNhan()
    {
        // LƯU Ý QUAN TRỌNG về TimeOnly: TimeOnly.AddMinutes WRAP quanh nửa đêm.
        // Vì vậy KHÔNG thể đặt một cửa sổ cố định (vd 00:00 + 24h) để "luôn mở":
        // latest = GioBatDau.AddMinutes(PhutChoPhepTre) sẽ wrap và nhỏ hơn now -> bị chặn "quá giờ".
        // Thay vào đó, dẫn xuất cấu hình từ giờ chạy test:
        //   GioBatDau = now - 30 phút, PhutChoPhepTre = 60 => now <= latest (= now + 30) và now > GioBatDau.
        // => cửa sổ luôn mở quanh "now", trạng thái = "Trễ" (now > GioBatDau).
        // Bỏ qua nếu chạy trong 30 phút đầu ngày (now - 30 phút wrap qua nửa đêm làm cửa sổ sai).
        using var ctx = CreateContext();
        var now = TimeOnly.FromDateTime(DateTime.Now);
        if (now < new TimeOnly(0, 30)) return;

        var batDau = now.AddMinutes(-30);
        await SeedConfig(ctx, batDau, new TimeOnly(23, 59), phutSom: 0, phutTre: 60);
        var svc = NewService(ctx);

        var res = await svc.CheckInAsync(UserWith("NV001"));

        Assert.True(res.Success);
        Assert.Single(ctx.ChamCongs);
        var cc = await ctx.ChamCongs.FirstAsync();
        Assert.Equal("NV001", cc.MaNV);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), cc.Ngay);
        Assert.NotNull(cc.GioVao);
        Assert.Null(cc.GioRa);
        // now > GioBatDau (= now - 30) => "Trễ".
        Assert.Equal("Trễ", cc.TrangThai);
    }

    [Fact]
    public async Task CheckIn_KhungGioLuonDong_TraVeThatBaiVaKhongTaoBanGhi()
    {
        // Cửa sổ 00:00 -> 00:00 và không cho phép sớm/trễ: giờ hiện tại gần như luôn > latest (00:00)
        // => luôn bị "quá giờ check-in". (Ngoại lệ duy nhất là đúng 00:00:00, cực khó trúng.)
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(0, 0), phutSom: 0, phutTre: 0);
        var svc = NewService(ctx);

        var res = await svc.CheckInAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Empty(ctx.ChamCongs);
    }

    // ===== check-in: trùng trong ngày =====

    [Fact]
    public async Task CheckIn_DaCoBanGhiHomNay_TraVeThatBai()
    {
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(23, 59), phutTre: 24 * 60);
        ctx.ChamCongs.Add(new ChamCong
        {
            MaNV = "NV001",
            Ngay = DateOnly.FromDateTime(DateTime.Today),
            GioVao = new TimeOnly(7, 30),
            TrangThai = "Đủ công"
        });
        await ctx.SaveChangesAsync();

        var res = await NewService(ctx).CheckInAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Contains("đã check-in", res.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Single(ctx.ChamCongs);
    }

    // ===== check-in: ranh giới sớm (trước GioBatDau - PhutChoPhepSom) =====

    [Fact]
    public async Task CheckIn_QuaSom_TraVeThatBai()
    {
        // GioBatDau = 23:59, PhutChoPhepSom = 0 -> earliest = 23:59.
        // Vào bất kỳ thời điểm nào TRƯỚC 23:59 (gần như cả ngày) đều bị chặn "chưa đến giờ".
        // PhutChoPhepTre = 0 để nhánh "quá giờ" không nuốt mất; vì now < earliest nên thoát ở nhánh sớm.
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(23, 59), new TimeOnly(23, 59), phutSom: 0, phutTre: 0);
        var svc = NewService(ctx);

        var res = await svc.CheckInAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Contains("Chưa đến giờ", res.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(ctx.ChamCongs);
    }

    // ===== check-in: ranh giới trễ (sau GioBatDau + PhutChoPhepTre) =====

    [Fact]
    public async Task CheckIn_QuaGioCheckIn_TraVeThatBai()
    {
        // GioBatDau = 00:00, PhutChoPhepTre = 0 -> latest = 00:00.
        // nowTime > 00:00 hầu như luôn đúng -> "Đã quá giờ check-in".
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(23, 59), phutSom: 0, phutTre: 0);
        var svc = NewService(ctx);

        var res = await svc.CheckInAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Contains("quá giờ check-in", res.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(ctx.ChamCongs);
    }

    // ===== check-in: trạng thái "Đủ công" =====
    // Để đạt "Đủ công" cần nowTime <= GioBatDau mà vẫn qua được cổng chặn sớm (nowTime >= GioBatDau - PhutSom).
    // Chỉ khoảng [GioBatDau - PhutSom, GioBatDau] mới cho "Đủ công". Không thể ép giá trị lịch sử cố định,
    // nên ta chọn GioBatDau theo giờ hiện tại: đặt cửa sổ sao cho giờ test rơi vào khoảng này.
    [Fact]
    public async Task CheckIn_TrongKhoangChoPhepSomTraVeDuCong()
    {
        using var ctx = CreateContext();
        var now = TimeOnly.FromDateTime(DateTime.Now);
        // GioBatDau = now + 5 phút, cho phép sớm 30 phút -> now nằm trong [GioBatDau-30, GioBatDau] => "Đủ công".
        // Bỏ qua nếu chạy trong 5 phút cuối ngày: TimeOnly.AddMinutes wrap qua nửa đêm làm cửa sổ sai.
        if (now > new TimeOnly(23, 50)) return; // không assert khi gần nửa đêm

        var batDau = now.AddMinutes(5);
        await SeedConfig(ctx, batDau, new TimeOnly(23, 59), phutSom: 30, phutTre: 120);
        var svc = NewService(ctx);

        var res = await svc.CheckInAsync(UserWith("NV001"));

        Assert.True(res.Success);
        var cc = await ctx.ChamCongs.FirstAsync();
        Assert.Equal("Đủ công", cc.TrangThai);
    }

    // ===== check-out =====

    [Fact]
    public async Task CheckOut_ChuaCheckIn_TraVeThatBai()
    {
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(0, 0), batBuocCheckOutSauKetThuc: false);
        var res = await NewService(ctx).CheckOutAsync(UserWith("NV001"));
        Assert.False(res.Success);
        Assert.Contains("chưa check-in", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CheckOut_DaCheckOutRoi_TraVeThatBai()
    {
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(0, 0), batBuocCheckOutSauKetThuc: false);
        ctx.ChamCongs.Add(new ChamCong
        {
            MaNV = "NV001",
            Ngay = DateOnly.FromDateTime(DateTime.Today),
            GioVao = new TimeOnly(7, 0),
            GioRa = new TimeOnly(17, 0),
            TrangThai = "Đủ công"
        });
        await ctx.SaveChangesAsync();

        var res = await NewService(ctx).CheckOutAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Contains("đã check-out", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CheckOut_ChuaHetGio_TraVeThatBai()
    {
        // BatBuocCheckOutSauKetThuc = true và GioKetThuc = 23:59 -> hầu như luôn "chưa hết giờ".
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(23, 59), batBuocCheckOutSauKetThuc: true);
        ctx.ChamCongs.Add(new ChamCong
        {
            MaNV = "NV001",
            Ngay = DateOnly.FromDateTime(DateTime.Today),
            GioVao = new TimeOnly(7, 0),
            TrangThai = "Đủ công"
        });
        await ctx.SaveChangesAsync();

        var res = await NewService(ctx).CheckOutAsync(UserWith("NV001"));

        Assert.False(res.Success);
        Assert.Contains("Chưa hết giờ", res.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CheckOut_KhongBatBuocSauKetThuc_CapNhatGioRa()
    {
        // BatBuocCheckOutSauKetThuc = false -> bỏ qua cổng thời gian, cho check-out và ghi GioRa.
        using var ctx = CreateContext();
        await SeedConfig(ctx, new TimeOnly(0, 0), new TimeOnly(23, 59), batBuocCheckOutSauKetThuc: false);
        ctx.ChamCongs.Add(new ChamCong
        {
            MaNV = "NV001",
            Ngay = DateOnly.FromDateTime(DateTime.Today),
            GioVao = new TimeOnly(7, 0),
            TrangThai = "Đủ công"
        });
        await ctx.SaveChangesAsync();

        var res = await NewService(ctx).CheckOutAsync(UserWith("NV001"));

        Assert.True(res.Success);
        var cc = await ctx.ChamCongs.FirstAsync();
        Assert.NotNull(cc.GioRa);
    }

    // ===== GetCauHinhAsync: hành vi khi KHÔNG có cấu hình =====

    [Fact]
    public async Task GetCauHinhDto_KhongCoCauHinh_TraVeMacDinh()
    {
        // GetCauHinhAsync trả default trong bộ nhớ (KHÔNG persist): 08:00-17:30, sớm 15, trễ 0.
        using var ctx = CreateContext();
        var res = await NewService(ctx).GetCauHinhDtoAsync();

        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(new TimeOnly(8, 0), res.Data!.GioBatDau);
        Assert.Equal(new TimeOnly(17, 30), res.Data.GioKetThuc);
        Assert.Equal(15, res.Data.PhutChoPhepSom);
        Assert.Equal(0, res.Data.PhutChoPhepTre);
        // Quan trọng: không persist default vào DB (nếu persist, lần sau FirstOrDefault sẽ thấy).
        Assert.Empty(ctx.CauHinhChamCongs);
    }

    // ===== UpdateCauHinhAsync: kiểm tra ràng buộc =====

    [Fact]
    public async Task UpdateCauHinh_GioKetThucTruocGioBatDau_TraVeThatBai()
    {
        using var ctx = CreateContext();
        var res = await NewService(ctx).UpdateCauHinhAsync(new HRM.Core.DTOs.ChamCong.UpdateCauHinhChamCongDto
        {
            GioBatDau = new TimeOnly(17, 0),
            GioKetThuc = new TimeOnly(8, 0)
        });
        Assert.False(res.Success);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(121)]
    public async Task UpdateCauHinh_PhutChoPhepSomNgoai0Den120_TraVeThatBai(int phutSom)
    {
        using var ctx = CreateContext();
        var res = await NewService(ctx).UpdateCauHinhAsync(new HRM.Core.DTOs.ChamCong.UpdateCauHinhChamCongDto
        {
            GioBatDau = new TimeOnly(8, 0),
            GioKetThuc = new TimeOnly(17, 0),
            PhutChoPhepSom = phutSom
        });
        Assert.False(res.Success);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(121)]
    public async Task UpdateCauHinh_PhutChoPhepTreNgoai0Den120_TraVeThatBai(int phutTre)
    {
        using var ctx = CreateContext();
        var res = await NewService(ctx).UpdateCauHinhAsync(new HRM.Core.DTOs.ChamCong.UpdateCauHinhChamCongDto
        {
            GioBatDau = new TimeOnly(8, 0),
            GioKetThuc = new TimeOnly(17, 0),
            PhutChoPhepTre = phutTre
        });
        Assert.False(res.Success);
    }

    [Fact]
    public async Task UpdateCauHinh_HopLe_LuuVaDocLai()
    {
        using var ctx = CreateContext();
        var svc = NewService(ctx);
        var res = await svc.UpdateCauHinhAsync(new HRM.Core.DTOs.ChamCong.UpdateCauHinhChamCongDto
        {
            GioBatDau = new TimeOnly(8, 30),
            GioKetThuc = new TimeOnly(18, 0),
            PhutChoPhepSom = 10,
            PhutChoPhepTre = 15,
            BatBuocCheckOutSauKetThuc = true
        });

        Assert.True(res.Success);
        var doc = await svc.GetCauHinhDtoAsync();
        Assert.Equal(new TimeOnly(8, 30), doc.Data!.GioBatDau);
        Assert.Equal(new TimeOnly(18, 0), doc.Data.GioKetThuc);
        Assert.Equal(10, doc.Data.PhutChoPhepSom);
        Assert.Equal(15, doc.Data.PhutChoPhepTre);
    }
}
