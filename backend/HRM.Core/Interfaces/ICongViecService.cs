using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.Kanban;

namespace HRM.Core.Interfaces;

public interface ICongViecService
{
    Task<ApiResponse<KanbanBoardDto>> GetBoardAsync(string? maNV, string? doUuTien, string? search, ClaimsPrincipal user);
    Task<ApiResponse<TaskItemDto>> GetByIdAsync(int id, ClaimsPrincipal user);
    Task<ApiResponse<TaskItemDto>> CreateTaskAsync(CreateTaskDto dto, ClaimsPrincipal user);
    Task<ApiResponse<TaskItemDto>> UpdateTaskAsync(int id, UpdateTaskDto dto, ClaimsPrincipal user);
    Task<ApiResponse<TaskItemDto>> MoveTaskAsync(int id, MoveTaskDto dto, ClaimsPrincipal user);
    Task<ApiResponse<bool>> DeleteTaskAsync(int id, ClaimsPrincipal user);
    Task<ApiResponse<List<BinhLuanDto>>> GetCommentsAsync(int taskId, ClaimsPrincipal user);
    Task<ApiResponse<BinhLuanDto>> AddCommentAsync(int taskId, CreateBinhLuanDto dto, ClaimsPrincipal user);
}
