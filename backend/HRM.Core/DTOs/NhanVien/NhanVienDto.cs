namespace HRM.Core.DTOs.NhanVien;

public class NhanVienDto
{
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string GioiTinh { get; set; } = string.Empty;
    public DateOnly NgaySinh { get; set; }
    public string CCCD { get; set; } = string.Empty;
    public string? SDT { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string MaCV { get; set; } = string.Empty;
    public string TenCV { get; set; } = string.Empty;
    public DateOnly NgayVaoLam { get; set; }
    public string TrangThai { get; set; } = "Đang làm";
}
