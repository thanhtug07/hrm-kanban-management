namespace HRM.Core.DTOs.TaiKhoan;

public class TaiKhoanDto
{
    public int MaTK { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public string? HoTen { get; set; }
    public string? TenPB { get; set; }
    public string? TenCV { get; set; }
    public string? Email { get; set; }
    public bool TrangThai { get; set; }
    public DateTime NgayTao { get; set; }
}

public class CreateTaiKhoanDto
{
    public string? MaNV { get; set; } // Tùy ý: có thể chọn hoặc không cần có trong DS công ty
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = "Hrm@123456";
    public string VaiTro { get; set; } = "NhanVien"; // Admin | HR | NhanVien
}

public class UpdateTaiKhoanDto
{
    public string? TenDangNhap { get; set; } // Đổi tên đăng nhập tùy ý
    public string? MatKhauMoi { get; set; }  // Đổi mật khẩu tùy ý (nếu có nhập)
    public string? VaiTro { get; set; }      // Admin | HR | NhanVien
    public string? MaNV { get; set; }        // Cập nhật hoặc bỏ liên kết
}

public class UpdateTrangThaiDto
{
    public bool TrangThai { get; set; }
}

public class ResetPasswordDto
{
    public string? MatKhauMoi { get; set; } = "Hrm@123456";
}
