namespace HRM.Core.Entities;

public class TaiKhoan
{
    public int MaTK { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhauHash { get; set; } = string.Empty;
    public string VaiTro { get; set; } = "NhanVien"; // Admin | HR | NhanVien
    public string? MaNV { get; set; }
    public bool TrangThai { get; set; } = true;
    public DateTime NgayTao { get; set; } = DateTime.Now;

    // Navigation property
    public virtual NhanVien? NhanVien { get; set; }
}
