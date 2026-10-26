namespace HRM.Core.Entities;

public class CongViec
{
    public int MaTask { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string MaNV_PhuTrach { get; set; } = string.Empty;
    public string MaNV_Giao { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "Todo"; // Todo | InProgress | Done
    public int ViTri { get; set; } // Gap-based ordering: 1000, 2000, 3000...
    public string DoUuTien { get; set; } = "Trung bình"; // Thấp | Trung bình | Cao | Khẩn cấp
    public DateOnly? NgayBatDau { get; set; }
    public DateOnly? Deadline { get; set; }
    public DateTime? NgayHoanThanh { get; set; } // Tự set bởi Trigger TR_CongViec_Update
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime NgayCapNhat { get; set; } = DateTime.Now;
    public bool DaXoa { get; set; } = false; // Soft Delete

    // Navigation properties
    public virtual NhanVien NhanVienPhuTrach { get; set; } = null!;
    public virtual NhanVien NhanVienGiao { get; set; } = null!;
    public virtual ICollection<BinhLuan> BinhLuans { get; set; } = new List<BinhLuan>();
}
