namespace HRM.Core.Entities;

public class ChucVu
{
    public string MaCV { get; set; } = string.Empty;
    public string TenCV { get; set; } = string.Empty;
    public decimal LuongCoBan { get; set; }
    public string? MoTa { get; set; }

    // Navigation properties
    public virtual ICollection<NhanVien> NhanViens { get; set; } = new List<NhanVien>();
}
