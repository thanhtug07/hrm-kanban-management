using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.Kanban;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CongViecController : ControllerBase
{
    private readonly ICongViecService _congViecService;

    public CongViecController(ICongViecService congViecService)
    {
        _congViecService = congViecService;
    }

    /// <summary>
    /// Lấy toàn bộ bảng Kanban phân thành 3 mảng (Todo, InProgress, Done) từ View VW_BoardKanban
    /// </summary>
    [HttpGet("board")]
    [ProducesResponseType(typeof(ApiResponse<KanbanBoardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBoard([FromQuery] string? maNV, [FromQuery] string? doUuTien, [FromQuery] string? search)
    {
        var result = await _congViecService.GetBoardAsync(maNV, doUuTien, search, User);
        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết 1 công việc theo mã
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _congViecService.GetByIdAsync(id, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Tạo công việc mới (Chỉ Admin và HR được phép)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = RoleConstants.Managers)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        var result = await _congViecService.CreateTaskAsync(dto, User);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.MaTask }, result);
    }

    /// <summary>
    /// Cập nhật thông tin chi tiết công việc (Chỉ Admin và HR được phép)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleConstants.Managers)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        var result = await _congViecService.UpdateTaskAsync(id, dto, User);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Kéo thả di chuyển công việc (gọi Stored Procedure SP_DiChuyenTask gap-based 1000)
    /// </summary>
    [HttpPut("{id:int}/move")]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MoveTask(int id, [FromBody] MoveTaskDto dto)
    {
        var result = await _congViecService.MoveTaskAsync(id, dto, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa mềm công việc (Chỉ Admin và HR được phép)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleConstants.Managers)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var result = await _congViecService.DeleteTaskAsync(id, User);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return NoContent();
    }

    /// <summary>
    /// Lấy danh sách bình luận trên công việc
    /// </summary>
    [HttpGet("{id:int}/binhluan")]
    [ProducesResponseType(typeof(ApiResponse<List<BinhLuanDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<BinhLuanDto>>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<List<BinhLuanDto>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetComments(int id)
    {
        var result = await _congViecService.GetCommentsAsync(id, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Thêm bình luận trao đổi trên công việc
    /// </summary>
    [HttpPost("{id:int}/binhluan")]
    [ProducesResponseType(typeof(ApiResponse<BinhLuanDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<BinhLuanDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<BinhLuanDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateBinhLuanDto dto)
    {
        var result = await _congViecService.AddCommentAsync(id, dto, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }
}
