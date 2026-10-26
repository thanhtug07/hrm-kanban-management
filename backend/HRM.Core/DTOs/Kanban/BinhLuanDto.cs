namespace HRM.Core.DTOs.Kanban;

public class BinhLuanDto
{
    public int MaBL { get; set; }
    public int MaTask { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public DateTime ThoiGian { get; set; }
}
