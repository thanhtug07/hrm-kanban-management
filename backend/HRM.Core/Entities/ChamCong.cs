namespace HRM.Core.Entities;

public class ChamCong
{
    public int MaCC { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public DateOnly Ngay { get; set; }
    public TimeOnly? GioVao { get; set; }
    public TimeOnly? GioRa { get; set; }
    public string TrangThai { get; set; } = "Đủ công";

    // Navigation property
    public virtual NhanVien NhanVien { get; set; } = null!;
}
