namespace HRM.Core.Entities;

public class BangLuong
{
    public int MaBL { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public byte Thang { get; set; }
    public short Nam { get; set; }
    public int SoNgayCong { get; set; }
    public decimal LuongCoBan { get; set; }
    public decimal PhuCap { get; set; }
    public decimal KhauTru { get; set; }
    public decimal ThucLinh { get; set; } // Computed persisted column

    // Navigation property
    public virtual NhanVien NhanVien { get; set; } = null!;
}
