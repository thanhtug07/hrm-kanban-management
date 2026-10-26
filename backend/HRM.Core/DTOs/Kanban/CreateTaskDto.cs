namespace HRM.Core.DTOs.Kanban;

public class CreateTaskDto
{
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string MaNV_PhuTrach { get; set; } = string.Empty;
    public string DoUuTien { get; set; } = "Trung bình";
    public DateOnly? NgayBatDau { get; set; }
    public DateOnly? Deadline { get; set; }
}
