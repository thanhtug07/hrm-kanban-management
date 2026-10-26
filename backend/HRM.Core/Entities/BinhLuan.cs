namespace HRM.Core.Entities;

public class BinhLuan
{
    public int MaBL { get; set; }
    public int MaTask { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public DateTime ThoiGian { get; set; } = DateTime.Now;

    // Navigation properties
    public virtual CongViec CongViec { get; set; } = null!;
    public virtual NhanVien NhanVien { get; set; } = null!;
}
