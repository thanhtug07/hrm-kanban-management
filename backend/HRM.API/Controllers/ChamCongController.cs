using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.ChamCong;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChamCongController : ControllerBase
{
    private readonly IChamCongService _chamCongService;

    public ChamCongController(IChamCongService chamCongService)
    {
        _chamCongService = chamCongService;
    }

    /// <summary>
    /// Điểm danh vào làm (Check-in) trong ngày cho nhân viên đang đăng nhập
    /// </summary>
    [HttpPost("checkin")]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckIn()
    {
        var result = await _chamCongService.CheckInAsync(User);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Điểm danh ra về (Check-out) trong ngày cho nhân viên đang đăng nhập
    /// </summary>
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckOut()
    {
        var result = await _chamCongService.CheckOutAsync(User);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xem lịch sử chấm công của cá nhân trong tháng
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<List<ChamCongDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyAttendance([FromQuery] int? thang, [FromQuery] int? nam)
    {
        var result = await _chamCongService.GetMyAttendanceAsync(thang, nam, User);
        return Ok(result);
    }

    /// <summary>
    /// Danh sách bảng chấm công toàn công ty theo tháng/năm/trạng thái (Admin/HR)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = RoleConstants.Managers)]
    [ProducesResponseType(typeof(ApiResponse<List<ChamCongDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList([FromQuery] ChamCongFilterDto filter)
    {
        var result = await _chamCongService.GetListAsync(filter, User);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật điều chỉnh bản ghi chấm công (Admin/HR)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = RoleConstants.Managers)]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ChamCongDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateChamCongDto dto)
    {
        var result = await _chamCongService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
