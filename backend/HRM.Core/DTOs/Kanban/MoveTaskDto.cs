namespace HRM.Core.DTOs.Kanban;

public class MoveTaskDto
{
    public string TrangThaiMoi { get; set; } = string.Empty;
    public int? MaTaskTruoc { get; set; }
    public int? MaTaskSau { get; set; }
}
