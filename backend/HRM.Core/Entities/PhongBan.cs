namespace HRM.Core.Entities;

public class PhongBan
{
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public DateTime? NgayThanhLap { get; set; }
    public string? MaNV_QL { get; set; }

    // Navigation properties
    public virtual NhanVien? TruongPhong { get; set; }
    public virtual ICollection<NhanVien> NhanViens { get; set; } = new List<NhanVien>();
}
