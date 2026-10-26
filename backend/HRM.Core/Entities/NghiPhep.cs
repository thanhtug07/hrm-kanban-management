namespace HRM.Core.Entities;

public class NghiPhep
{
    public int MaNP { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string LoaiPhep { get; set; } = "Phép năm";
    public DateOnly TuNgay { get; set; }
    public DateOnly DenNgay { get; set; }
    public string? LyDo { get; set; }
    public string TrangThai { get; set; } = "Chờ duyệt";
    public string? MaNV_Duyet { get; set; }
    public DateTime? NgayDuyet { get; set; }

    // Navigation properties
    public virtual NhanVien NhanVien { get; set; } = null!;
    public virtual NhanVien? NhanVienDuyet { get; set; }
}
