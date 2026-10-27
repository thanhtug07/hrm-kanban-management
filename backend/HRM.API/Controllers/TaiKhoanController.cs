using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.TaiKhoan;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class TaiKhoanController : ControllerBase
{
    private readonly ITaiKhoanService _taiKhoanService;

    public TaiKhoanController(ITaiKhoanService taiKhoanService)
    {
        _taiKhoanService = taiKhoanService;
    }

    /// <summary>Lấy danh sách tài khoản (phân trang + tìm kiếm + lọc vai trò)</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TaiKhoanDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? vaiTro,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _taiKhoanService.GetAllAsync(search, vaiTro, page, pageSize);
        return Ok(result);
    }

    /// <summary>Cấp tài khoản mới</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TaiKhoanDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateTaiKhoanDto dto)
    {
        var result = await _taiKhoanService.CreateAsync(dto, User);
        if (!result.Success)
            return MapError(result);

        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Chỉnh sửa tài khoản: tên đăng nhập, mật khẩu, vai trò, nhân viên liên kết</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaiKhoanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaiKhoanDto dto)
    {
        var result = await _taiKhoanService.UpdateAsync(id, dto, User);
        return result.Success ? Ok(result) : MapError(result);
    }

    /// <summary>Bật/Tắt trạng thái hoạt động của tài khoản</summary>
    [HttpPut("{id:int}/trangthai")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTrangThaiDto dto)
    {
        var result = await _taiKhoanService.UpdateStatusAsync(id, dto.TrangThai, User);
        return result.Success ? Ok(result) : MapError(result);
    }

    /// <summary>Đặt lại mật khẩu về mặc định</summary>
    [HttpPut("{id:int}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
    {
        var result = await _taiKhoanService.ResetPasswordAsync(id, dto?.MatKhauMoi, User);
        return result.Success ? Ok(result) : MapError(result);
    }

    /// <summary>Xóa tài khoản (Chỉ Admin)</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _taiKhoanService.DeleteAsync(id, User);
        return result.Success ? Ok(result) : MapError(result);
    }

    /// <summary>Map ErrorCode nghiệp vụ → HTTP status chuẩn (không so khớp chuỗi Message).</summary>
    private IActionResult MapError<T>(ApiResponse<T> result) => result.ErrorCode switch
    {
        ErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result),
        ErrorCode.NotFound => NotFound(result),
        ErrorCode.Conflict => Conflict(result),
        ErrorCode.Unauthorized => Unauthorized(result),
        _ => BadRequest(result)
    };
}
