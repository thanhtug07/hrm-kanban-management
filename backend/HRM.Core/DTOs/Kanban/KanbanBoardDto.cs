namespace HRM.Core.DTOs.Kanban;

public class KanbanBoardDto
{
    public List<TaskItemDto> Todo { get; set; } = new();
    public List<TaskItemDto> InProgress { get; set; } = new();
    public List<TaskItemDto> Review { get; set; } = new();
    public List<TaskItemDto> Done { get; set; } = new();
    public int TotalTasks { get; set; }
    public int OverdueTasks { get; set; }
}
