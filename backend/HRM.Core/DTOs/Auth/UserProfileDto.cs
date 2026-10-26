namespace HRM.Core.DTOs.Auth;

public class UserProfileDto
{
    public int MaTK { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string MaCV { get; set; } = string.Empty;
    public string TenCV { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SDT { get; set; } = string.Empty;
}
