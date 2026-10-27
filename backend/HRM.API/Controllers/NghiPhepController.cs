using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.NghiPhep;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NghiPhepController : ControllerBase
{
    private readonly INghiPhepService _nghiPhepService;

    public NghiPhepController(INghiPhepService nghiPhepService)
    {
        _nghiPhepService = nghiPhepService;
    }

    /// <summary>
    /// Gửi đơn xin nghỉ phép mới (Cá nhân tự tạo)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNghiPhepDto dto)
    {
        var result = await _nghiPhepService.CreateAsync(dto, User);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Lấy danh sách các đơn nghỉ phép của cá nhân đang đăng nhập
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<List<NghiPhepDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyLeaves()
    {
        var result = await _nghiPhepService.GetMyLeavesAsync(User);
        return Ok(result);
    }

    /// <summary>
    /// Danh sách toàn bộ đơn nghỉ phép trong công ty (Admin/HR)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<List<NghiPhepDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllLeaves([FromQuery] string? trangThai, [FromQuery] string? maNV)
    {
        var result = await _nghiPhepService.GetAllLeavesAsync(trangThai, maNV);
        return Ok(result);
    }

    /// <summary>
    /// Phê duyệt hoặc từ chối đơn nghỉ phép (Admin/HR - kích hoạt Trigger tự sinh chấm công)
    /// </summary>
    [HttpPut("{id:int}/duyet")]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<NghiPhepDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Duyet(int id, [FromBody] DuyetNghiPhepDto dto)
    {
        var result = await _nghiPhepService.DuyetAsync(id, dto, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            if (result.ErrorCode == HRM.Core.Common.ErrorCode.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Hủy đơn nghỉ phép (Chỉ được hủy khi đang ở trạng thái Chờ duyệt)
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _nghiPhepService.DeleteAsync(id, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            if (result.ErrorCode == HRM.Core.Common.ErrorCode.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return NoContent();
    }
}
