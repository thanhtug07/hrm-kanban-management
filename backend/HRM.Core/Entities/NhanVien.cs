namespace HRM.Core.Entities;

public class NhanVien
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
    public string MaCV { get; set; } = string.Empty;
    public DateOnly NgayVaoLam { get; set; }
    public string TrangThai { get; set; } = "Đang làm";

    // Navigation properties
    public virtual PhongBan PhongBan { get; set; } = null!;
    public virtual ChucVu ChucVu { get; set; } = null!;
    public virtual TaiKhoan? TaiKhoan { get; set; }
    public virtual ICollection<HopDong> HopDongs { get; set; } = new List<HopDong>();
    public virtual ICollection<ChamCong> ChamCongs { get; set; } = new List<ChamCong>();
    public virtual ICollection<NghiPhep> NghiPheps { get; set; } = new List<NghiPhep>();
    public virtual ICollection<NghiPhep> NghiPhepDuyets { get; set; } = new List<NghiPhep>();
    public virtual ICollection<BangLuong> BangLuongs { get; set; } = new List<BangLuong>();
    public virtual ICollection<CongViec> CongViecPhuTrachs { get; set; } = new List<CongViec>();
    public virtual ICollection<CongViec> CongViecGiaos { get; set; } = new List<CongViec>();
    public virtual ICollection<BinhLuan> BinhLuans { get; set; } = new List<BinhLuan>();
}
