namespace HRM.Core.DTOs.BangLuong;

public class ChiPhiPhatSinhDto
{
    public int MaPS { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string Loai { get; set; } = string.Empty; // Thưởng, Phạt, Ứng lương, Công tác phí
    public decimal SoTien { get; set; }
    public string? LyDo { get; set; }
    public byte Thang { get; set; }
    public short Nam { get; set; }
    public DateTime NgayTao { get; set; }
}

public class CreateChiPhiPhatSinhDto
{
    public string MaNV { get; set; } = string.Empty;
    public string Loai { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public string? LyDo { get; set; }
    public byte Thang { get; set; }
    public short Nam { get; set; }
}
