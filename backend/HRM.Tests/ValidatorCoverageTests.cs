using FluentValidation.TestHelper;
using HRM.Application.Validators;
using HRM.Core.DTOs.Auth;
using HRM.Core.DTOs.BangLuong;
using HRM.Core.DTOs.ChamCong;
using HRM.Core.DTOs.Kanban;
using HRM.Core.DTOs.NghiPhep;
using Xunit;

namespace HRM.Tests;

/// <summary>
/// Coverage cho các FluentValidation validator chưa được test trước đây.
/// Tập trung vào ràng buộc chéo trường (cross-field) và whitelist — loại lỗi
/// âm thầm cho dữ liệu sai lọt qua.
///
/// LƯU Ý: đây là unit test thuần trên validator. InMemory/SQL đều không liên quan ở đây.
/// Validator KHÔNG kiểm tra existence (MaNV có tồn tại không...) hay quyền — đó là việc của Service.
/// </summary>
public class ValidatorCoverageTests
{
    // ===== CreateNghiPhepValidator =====
    [Fact]
    public void CreateNghiPhep_HopLe_Pass()
    {
        var v = new CreateNghiPhepValidator();
        var r = v.TestValidate(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm",
            TuNgay = new DateOnly(2026, 6, 1),
            DenNgay = new DateOnly(2026, 6, 3)
        });
        r.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("Phép năm")]
    [InlineData("Bệnh")]
    [InlineData("Thai sản")]
    [InlineData("Không lương")]
    public void CreateNghiPhep_LoaiPhepTrongWhitelist_Pass(string loai)
    {
        var v = new CreateNghiPhepValidator();
        var r = v.TestValidate(new CreateNghiPhepDto
        {
            LoaiPhep = loai,
            TuNgay = new DateOnly(2026, 6, 1),
            DenNgay = new DateOnly(2026, 6, 2)
        });
        r.ShouldNotHaveValidationErrorFor(x => x.LoaiPhep);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("Nghỉ ốm")]      // gần đúng nhưng KHÔNG nằm trong whitelist
    [InlineData("phép năm")]     // sai hoa/thường — whitelist so khớp chính xác
    public void CreateNghiPhep_LoaiPhepNgoaiWhitelist_Fail(string loai)
    {
        var v = new CreateNghiPhepValidator();
        var r = v.TestValidate(new CreateNghiPhepDto
        {
            LoaiPhep = loai,
            TuNgay = new DateOnly(2026, 6, 1),
            DenNgay = new DateOnly(2026, 6, 2)
        });
        r.ShouldHaveValidationErrorFor(x => x.LoaiPhep);
    }

    [Fact]
    public void CreateNghiPhep_DenNgayTruocTuNgay_Fail()
    {
        var v = new CreateNghiPhepValidator();
        var r = v.TestValidate(new CreateNghiPhepDto
        {
            LoaiPhep = "Phép năm",
            TuNgay = new DateOnly(2026, 6, 10),
            DenNgay = new DateOnly(2026, 6, 9)
        });
        r.ShouldHaveValidationErrorFor(x => x.DenNgay);
    }

    [Fact]
    public void CreateNghiPhep_DenNgayBangTuNgay_Pass()
    {
        // Biên: nghỉ 1 ngày (Từ == Đến) phải hợp lệ vì rule là GreaterThanOrEqualTo.
        var v = new CreateNghiPhepValidator();
        var r = v.TestValidate(new CreateNghiPhepDto
        {
            LoaiPhep = "Bệnh",
            TuNgay = new DateOnly(2026, 6, 10),
            DenNgay = new DateOnly(2026, 6, 10)
        });
        r.ShouldNotHaveValidationErrorFor(x => x.DenNgay);
    }

    // ===== DuyetNghiPhepValidator =====
    [Theory]
    [InlineData("Đã duyệt")]
    [InlineData("Từ chối")]
    public void DuyetNghiPhep_TrangThaiHopLe_Pass(string trangThai)
    {
        var v = new DuyetNghiPhepValidator();
        v.TestValidate(new DuyetNghiPhepDto { TrangThai = trangThai })
            .ShouldNotHaveValidationErrorFor(x => x.TrangThai);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Chờ duyệt")]     // trạng thái nguồn, không phải trạng thái duyệt
    [InlineData("đã duyệt")]      // sai hoa/thường
    [InlineData("Hủy")]
    public void DuyetNghiPhep_TrangThaiKhongHopLe_Fail(string trangThai)
    {
        var v = new DuyetNghiPhepValidator();
        v.TestValidate(new DuyetNghiPhepDto { TrangThai = trangThai })
            .ShouldHaveValidationErrorFor(x => x.TrangThai);
    }

    // ===== MoveTaskValidator =====
    [Theory]
    [InlineData("Todo")]
    [InlineData("InProgress")]
    [InlineData("Review")]
    [InlineData("Done")]
    public void MoveTask_TrangThaiHopLe_Pass(string tt)
    {
        var v = new MoveTaskValidator();
        v.TestValidate(new MoveTaskDto { TrangThaiMoi = tt })
            .ShouldNotHaveValidationErrorFor(x => x.TrangThaiMoi);
    }

    [Theory]
    [InlineData("")]
    [InlineData("todo")]          // sai hoa/thường
    [InlineData("In Progress")]   // có khoảng trắng
    [InlineData("Cancelled")]
    public void MoveTask_TrangThaiKhongHopLe_Fail(string tt)
    {
        var v = new MoveTaskValidator();
        v.TestValidate(new MoveTaskDto { TrangThaiMoi = tt })
            .ShouldHaveValidationErrorFor(x => x.TrangThaiMoi);
    }

    // ===== CreateChiPhiPhatSinhValidator =====
    private static CreateChiPhiPhatSinhDto ValidChiPhi() => new()
    {
        MaNV = "NV001",
        Loai = "Thưởng",
        SoTien = 100000m,
        Thang = 6,
        Nam = 2026,
        LyDo = "Thưởng KPI"
    };

    [Fact]
    public void CreateChiPhi_HopLe_Pass()
    {
        var v = new CreateChiPhiPhatSinhValidator();
        v.TestValidate(ValidChiPhi()).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]          // rule: GreaterThan(0) -> 0 phải bị chặn
    [InlineData(-1)]
    [InlineData(-500000)]
    public void CreateChiPhi_SoTienKhongDuong_Fail(decimal soTien)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.SoTien = soTien;
        v.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.SoTien);
    }

    [Theory]
    [InlineData(0)]       // dưới biên
    [InlineData(13)]      // trên biên
    [InlineData(255)]
    public void CreateChiPhi_ThangNgoai1Den12_Fail(byte thang)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.Thang = thang;
        v.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.Thang);
    }

    [Fact]
    public void CreateChiPhi_ThangBien1Va12_Pass()
    {
        var v = new CreateChiPhiPhatSinhValidator();
        foreach (var thang in new byte[] { 1, 12 })
        {
            var dto = ValidChiPhi();
            dto.Thang = thang;
            v.TestValidate(dto).ShouldNotHaveValidationErrorFor(x => x.Thang);
        }
    }

    [Theory]
    [InlineData((short)1999)]
    [InlineData((short)0)]
    [InlineData((short)-1)]
    public void CreateChiPhi_NamTruoc2000_Fail(short nam)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.Nam = nam;
        v.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.Nam);
    }

    [Theory]
    [InlineData("NV001", true)]
    [InlineData("NV00123", false)]  // 7 ký tự, rule Length(5)
    [InlineData("NV01", false)]     // 4 ký tự
    [InlineData("", false)]
    public void CreateChiPhi_MaNVDoDai5(string maNV, bool expectedValid)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.MaNV = maNV;
        var r = v.TestValidate(dto);
        if (expectedValid) r.ShouldNotHaveValidationErrorFor(x => x.MaNV);
        else r.ShouldHaveValidationErrorFor(x => x.MaNV);
    }

    [Theory]
    [InlineData("Thưởng")]
    [InlineData("Phạt")]
    [InlineData("Ứng lương")]
    [InlineData("Công tác phí")]
    public void CreateChiPhi_LoaiHopLe_Pass(string loai)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.Loai = loai;
        v.TestValidate(dto).ShouldNotHaveValidationErrorFor(x => x.Loai);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Thưởng nóng")]
    public void CreateChiPhi_LoaiKhongHopLe_Fail(string loai)
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.Loai = loai;
        v.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.Loai);
    }

    [Fact]
    public void CreateChiPhi_LyDoQua255KyTu_Fail()
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.LyDo = new string('a', 256);
        v.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.LyDo);
    }

    [Fact]
    public void CreateChiPhi_LyDoDung255KyTu_Pass()
    {
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.LyDo = new string('a', 255);
        v.TestValidate(dto).ShouldNotHaveValidationErrorFor(x => x.LyDo);
    }

    [Fact]
    public void CreateChiPhi_LyDoNull_Pass()
    {
        // LyDo là optional -> null không được lỗi
        var v = new CreateChiPhiPhatSinhValidator();
        var dto = ValidChiPhi();
        dto.LyDo = null;
        v.TestValidate(dto).ShouldNotHaveValidationErrorFor(x => x.LyDo);
    }

    // ===== UpdateChamCongValidator =====
    [Theory]
    [InlineData("Đủ công")]
    [InlineData("Trễ")]
    [InlineData("Vắng")]
    [InlineData("Nghỉ phép")]
    public void UpdateChamCong_TrangThaiHopLe_Pass(string tt)
    {
        var v = new UpdateChamCongValidator();
        v.TestValidate(new UpdateChamCongDto { TrangThai = tt })
            .ShouldNotHaveValidationErrorFor(x => x.TrangThai);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Đi muộn")]     // gần nghĩa "Trễ" nhưng ngoài whitelist
    [InlineData("Nghỉ")]
    public void UpdateChamCong_TrangThaiKhongHopLe_Fail(string tt)
    {
        var v = new UpdateChamCongValidator();
        v.TestValidate(new UpdateChamCongDto { TrangThai = tt })
            .ShouldHaveValidationErrorFor(x => x.TrangThai);
    }

    [Fact]
    public void UpdateChamCong_GioRaTruocGioVao_Fail()
    {
        var v = new UpdateChamCongValidator();
        var r = v.TestValidate(new UpdateChamCongDto
        {
            TrangThai = "Đủ công",
            GioVao = new TimeOnly(17, 0),
            GioRa = new TimeOnly(8, 0)
        });
        Assert.False(r.IsValid);
    }

    [Fact]
    public void UpdateChamCong_GioRaBangGioVao_Pass()
    {
        // Biên: cho phép bằng nhau (>=), ví dụ ca 0 giờ.
        var v = new UpdateChamCongValidator();
        var r = v.TestValidate(new UpdateChamCongDto
        {
            TrangThai = "Đủ công",
            GioVao = new TimeOnly(8, 0),
            GioRa = new TimeOnly(8, 0)
        });
        Assert.True(r.IsValid);
    }

    [Theory]
    [InlineData(null, null)]              // cả hai null -> bỏ qua rule chéo
    [InlineData("08:00:00", null)]        // chỉ có giờ vào
    [InlineData(null, "17:00:00")]        // chỉ có giờ ra
    public void UpdateChamCong_ThieuMotTrongHaiGio_Pass(string? gioVao, string? gioRa)
    {
        // Rule chỉ áp dụng khi CẢ HAI có giá trị -> thiếu 1 phía phải hợp lệ.
        var v = new UpdateChamCongValidator();
        var r = v.TestValidate(new UpdateChamCongDto
        {
            TrangThai = "Đủ công",
            GioVao = gioVao == null ? null : TimeOnly.Parse(gioVao),
            GioRa = gioRa == null ? null : TimeOnly.Parse(gioRa)
        });
        Assert.True(r.IsValid);
    }

    // ===== LoginRequestValidator =====
    [Fact]
    public void Login_HopLe_Pass()
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = "admin", MatKhau = "secret123" })
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Login_TenDangNhapRong_Fail()
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = "", MatKhau = "secret123" })
            .ShouldHaveValidationErrorFor(x => x.TenDangNhap);
    }

    [Fact]
    public void Login_TenDangNhapQua50KyTu_Fail()
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = new string('a', 51), MatKhau = "secret123" })
            .ShouldHaveValidationErrorFor(x => x.TenDangNhap);
    }

    [Fact]
    public void Login_TenDangNhapDung50KyTu_Pass()
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = new string('a', 50), MatKhau = "secret123" })
            .ShouldNotHaveValidationErrorFor(x => x.TenDangNhap);
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]   // 5 ký tự < MinimumLength(6)
    public void Login_MatKhauRongHoacQuaNgan_Fail(string matKhau)
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = "admin", MatKhau = matKhau })
            .ShouldHaveValidationErrorFor(x => x.MatKhau);
    }

    [Fact]
    public void Login_MatKhauDung6KyTu_Pass()
    {
        var v = new LoginRequestValidator();
        v.TestValidate(new LoginRequestDto { TenDangNhap = "admin", MatKhau = "123456" })
            .ShouldNotHaveValidationErrorFor(x => x.MatKhau);
    }

    // ===== ChangePasswordValidator =====
    [Fact]
    public void ChangePassword_HopLe_Pass()
    {
        var v = new ChangePasswordValidator();
        v.TestValidate(new ChangePasswordDto { MatKhauCu = "oldpass1", MatKhauMoi = "newpass123" })
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ChangePassword_MatKhauMoiTrungMatKhauCu_Fail()
    {
        var v = new ChangePasswordValidator();
        v.TestValidate(new ChangePasswordDto { MatKhauCu = "samepass1", MatKhauMoi = "samepass1" })
            .ShouldHaveValidationErrorFor(x => x.MatKhauMoi);
    }

    [Theory]
    [InlineData("")]
    [InlineData("1234567")]  // 7 ký tự < MinimumLength(8)
    public void ChangePassword_MatKhauMoiQuaNgan_Fail(string moi)
    {
        var v = new ChangePasswordValidator();
        v.TestValidate(new ChangePasswordDto { MatKhauCu = "oldpass1", MatKhauMoi = moi })
            .ShouldHaveValidationErrorFor(x => x.MatKhauMoi);
    }

    [Fact]
    public void ChangePassword_MatKhauMoiDung8KyTu_Pass()
    {
        var v = new ChangePasswordValidator();
        v.TestValidate(new ChangePasswordDto { MatKhauCu = "oldpass1", MatKhauMoi = "12345678" })
            .ShouldNotHaveValidationErrorFor(x => x.MatKhauMoi);
    }

    [Fact]
    public void ChangePassword_MatKhauCuRong_Fail()
    {
        var v = new ChangePasswordValidator();
        v.TestValidate(new ChangePasswordDto { MatKhauCu = "", MatKhauMoi = "newpass123" })
            .ShouldHaveValidationErrorFor(x => x.MatKhauCu);
    }

    // ===== CreateBinhLuanValidator =====
    [Fact]
    public void CreateBinhLuan_HopLe_Pass()
    {
        var v = new CreateBinhLuanValidator();
        v.TestValidate(new CreateBinhLuanDto { NoiDung = "Nội dung bình luận" })
            .ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]   // NotEmpty cũng chặn chuỗi chỉ có khoảng trắng
    public void CreateBinhLuan_NoiDungRong_Fail(string noiDung)
    {
        var v = new CreateBinhLuanValidator();
        v.TestValidate(new CreateBinhLuanDto { NoiDung = noiDung })
            .ShouldHaveValidationErrorFor(x => x.NoiDung);
    }

    [Fact]
    public void CreateBinhLuan_NoiDungDung1000KyTu_Pass()
    {
        var v = new CreateBinhLuanValidator();
        v.TestValidate(new CreateBinhLuanDto { NoiDung = new string('a', 1000) })
            .ShouldNotHaveValidationErrorFor(x => x.NoiDung);
    }

    [Fact]
    public void CreateBinhLuan_NoiDungQua1000KyTu_Fail()
    {
        var v = new CreateBinhLuanValidator();
        v.TestValidate(new CreateBinhLuanDto { NoiDung = new string('a', 1001) })
            .ShouldHaveValidationErrorFor(x => x.NoiDung);
    }

    [Fact]
    public void CreateBinhLuan_NoiDungUnicode_Pass()
    {
        // Regresstion guard: độ dài đếm theo UTF-16 code unit; emoji BMP không được làm vỡ rule.
        var v = new CreateBinhLuanValidator();
        v.TestValidate(new CreateBinhLuanDto { NoiDung = "Bình luận tiếng Việt có dấu 🎉" })
            .ShouldNotHaveAnyValidationErrors();
    }
}
