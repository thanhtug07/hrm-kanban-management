using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.BangLuong;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BangLuongController : ControllerBase
{
    private readonly IBangLuongService _bangLuongService;

    public BangLuongController(IBangLuongService bangLuongService)
    {
        _bangLuongService = bangLuongService;
    }

    /// <summary>
    /// Chạy Stored Procedure SP_TinhLuongThang tính toán bảng lương tự động (Chỉ Admin)
    /// </summary>
    [HttpPost("tinhluong")]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(typeof(ApiResponse<TinhLuongResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TinhLuongResultDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TinhLuong([FromBody] TinhLuongRequestDto request)
    {
        var result = await _bangLuongService.TinhLuongAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách bảng lương toàn công ty theo tháng/năm (Admin/HR)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<List<BangLuongDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList([FromQuery] int? thang, [FromQuery] int? nam)
    {
        var result = await _bangLuongService.GetListAsync(thang, nam);
        return Ok(result);
    }

    /// <summary>
    /// Xem lịch sử bảng lương của cá nhân trong 12 tháng gần nhất
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<List<BangLuongDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPayroll()
    {
        var result = await _bangLuongService.GetMyPayrollAsync(User);
        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết 1 phiếu lương theo mã nhân viên, tháng, năm (Admin/HR hoặc chính nhân viên đó)
    /// </summary>
    [HttpGet("{maNV}/{thang:int}/{nam:int}")]
    [ProducesResponseType(typeof(ApiResponse<BangLuongDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BangLuongDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<BangLuongDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDetail(string maNV, int thang, int nam)
    {
        var result = await _bangLuongService.GetDetailAsync(maNV, thang, nam, User);
        if (!result.Success)
        {
            if (result.ErrorCode == HRM.Core.Common.ErrorCode.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Thêm chi phí phát sinh (Thưởng, Phạt, Ứng lương, Công tác phí) cho nhân viên (Admin/HR)
    /// </summary>
    [HttpPost("phatsinh")]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<ChiPhiPhatSinhDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ChiPhiPhatSinhDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePhatSinh([FromBody] CreateChiPhiPhatSinhDto dto)
    {
        var result = await _bangLuongService.CreatePhatSinhAsync(dto);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách chi phí phát sinh theo nhân viên, tháng, năm
    /// </summary>
    [HttpGet("phatsinh")]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<List<ChiPhiPhatSinhDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPhatSinhList([FromQuery] string? maNV, [FromQuery] int? thang, [FromQuery] int? nam)
    {
        var result = await _bangLuongService.GetPhatSinhListAsync(maNV, thang, nam);
        return Ok(result);
    }
}
