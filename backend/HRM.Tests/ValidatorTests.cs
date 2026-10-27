using HRM.Application.Validators;
using HRM.Core.DTOs.BangLuong;
using HRM.Core.DTOs.NhanVien;
using HRM.Core.DTOs.Kanban;
using Xunit;

namespace HRM.Tests;

/// <summary>
/// Unit test cho các FluentValidation validator — kiểm tra ràng buộc đầu vào.
/// </summary>
public class ValidatorTests
{
    // ===== TinhLuongValidator =====
    [Theory]
    [InlineData(0, 2026, false)]
    [InlineData(13, 2026, false)]
    [InlineData(10, 1999, false)]
    [InlineData(10, 2026, true)]
    [InlineData(1, 2000, true)]
    public void TinhLuong_Validate_ThangNam(byte thang, short nam, bool expectedValid)
    {
        var v = new TinhLuongValidator();
        var result = v.Validate(new TinhLuongRequestDto { Thang = thang, Nam = nam });
        Assert.Equal(expectedValid, result.IsValid);
    }

    // ===== CreateNhanVienValidator =====
    private static CreateNhanVienDto ValidNhanVien() => new()
    {
        HoTen = "Nguyễn Văn A",
        GioiTinh = "Nam",
        NgaySinh = new DateOnly(1995, 1, 1),
        CCCD = "001095012345",
        MaPB = "PB001",
        MaCV = "CV001",
        NgayVaoLam = new DateOnly(2024, 1, 1)
    };

    [Fact]
    public void CreateNhanVien_HopLe_ThanhCong()
    {
        var v = new CreateNhanVienValidator();
        Assert.True(v.Validate(ValidNhanVien()).IsValid);
    }

    [Theory]
    [InlineData("", false)]        // rỗng
    [InlineData("ABC", false)]     // không phải số
    [InlineData("123", false)]     // thiếu số
    [InlineData("0010950123456", false)] // thừa số
    public void CreateNhanVien_CCCDSaiThatBai(string cccd, bool expectedValid)
    {
        var v = new CreateNhanVienValidator();
        var dto = ValidNhanVien();
        dto.CCCD = cccd;
        Assert.Equal(expectedValid, v.Validate(dto).IsValid);
    }

    [Fact]
    public void CreateNhanVien_NgaySinhTuongLai_ThatBai()
    {
        var v = new CreateNhanVienValidator();
        var dto = ValidNhanVien();
        dto.NgaySinh = DateOnly.FromDateTime(DateTime.Today).AddDays(1);
        Assert.False(v.Validate(dto).IsValid);
    }

    [Fact]
    public void CreateNhanVien_EmailSai_ThatBai()
    {
        var v = new CreateNhanVienValidator();
        var dto = ValidNhanVien();
        dto.Email = "khong-phai-email";
        Assert.False(v.Validate(dto).IsValid);
    }

    [Theory]
    [InlineData("Nam", true)]
    [InlineData("Nữ", true)]
    [InlineData("Khac", false)]
    public void CreateNhanVien_GioiTinh(string gt, bool expectedValid)
    {
        var v = new CreateNhanVienValidator();
        var dto = ValidNhanVien();
        dto.GioiTinh = gt;
        Assert.Equal(expectedValid, v.Validate(dto).IsValid);
    }

    // ===== CreateTaskValidator =====
    [Fact]
    public void CreateTask_UuTienSai_ThatBai()
    {
        var v = new CreateTaskValidator();
        var dto = new CreateTaskDto
        {
            TieuDe = "Task test",
            MaNV_PhuTrach = "NV001",
            DoUuTien = "SaiSai"
        };
        Assert.False(v.Validate(dto).IsValid);
    }

    [Fact]
    public void CreateTask_DeadlineTruocNgayBatDau_ThatBai()
    {
        var v = new CreateTaskValidator();
        var dto = new CreateTaskDto
        {
            TieuDe = "Task test",
            MaNV_PhuTrach = "NV001",
            DoUuTien = "Cao",
            NgayBatDau = new DateOnly(2026, 12, 1),
            Deadline = new DateOnly(2026, 11, 1)
        };
        Assert.False(v.Validate(dto).IsValid);
    }

    [Fact]
    public void CreateTask_HopLe_ThanhCong()
    {
        var v = new CreateTaskValidator();
        var dto = new CreateTaskDto
        {
            TieuDe = "Task test",
            MaNV_PhuTrach = "NV001",
            DoUuTien = "Trung bình"
        };
        Assert.True(v.Validate(dto).IsValid);
    }
}
