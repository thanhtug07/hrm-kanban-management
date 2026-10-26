namespace HRM.Core.Entities;

public class BoardKanbanItem
{
    public int MaTask { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = "Todo";
    public int ViTri { get; set; }
    public string DoUuTien { get; set; } = "Trung bình";
    public DateOnly? NgayBatDau { get; set; }
    public DateOnly? Deadline { get; set; }
    public DateTime? NgayHoanThanh { get; set; }
    public string MaNV_PhuTrach { get; set; } = string.Empty;
    public string TenNV_PhuTrach { get; set; } = string.Empty;
    public string MaNV_Giao { get; set; } = string.Empty;
    public string TenNV_Giao { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public bool LaQuaHan { get; set; }
    public int SoBinhLuan { get; set; }
}
