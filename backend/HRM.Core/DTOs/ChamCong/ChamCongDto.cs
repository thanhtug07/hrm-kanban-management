namespace HRM.Core.DTOs.ChamCong;

public class ChamCongDto
{
    public int MaCC { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string? TenPhongBan { get; set; }
    public DateOnly Ngay { get; set; }
    public TimeOnly? GioVao { get; set; }
    public TimeOnly? GioRa { get; set; }
    public string TrangThai { get; set; } = "Đủ công";
}

public class ChamCongFilterDto
{
    public string? MaNV { get; set; }
    public string? MaPB { get; set; }
    public int? Thang { get; set; }
    public int? Nam { get; set; }
    public string? TrangThai { get; set; }
}

public class UpdateChamCongDto
{
    public TimeOnly? GioVao { get; set; }
    public TimeOnly? GioRa { get; set; }
    public string TrangThai { get; set; } = "Đủ công";
}
