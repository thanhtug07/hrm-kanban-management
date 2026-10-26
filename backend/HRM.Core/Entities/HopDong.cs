namespace HRM.Core.Entities;

public class HopDong
{
    public string MaHD { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string LoaiHD { get; set; } = "Chính thức";
    public DateTime NgayBatDau { get; set; }
    public DateTime? NgayKetThuc { get; set; }
    public decimal LuongThoaThuan { get; set; }
    public string TrangThai { get; set; } = "Hiệu lực";

    // Navigation property
    public virtual NhanVien NhanVien { get; set; } = null!;
}
