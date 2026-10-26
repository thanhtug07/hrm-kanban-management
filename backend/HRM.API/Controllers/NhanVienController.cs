using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.NhanVien;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NhanVienController : ControllerBase
{
    private readonly INhanVienService _nhanVienService;

    public NhanVienController(INhanVienService nhanVienService)
    {
        _nhanVienService = nhanVienService;
    }

    /// <summary>
    /// Danh sách nhân viên có phân trang, bộ lọc và sắp xếp (Admin/HR)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<NhanVienDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList([FromQuery] NhanVienFilterDto filter)
    {
        var result = await _nhanVienService.GetListAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Tìm kiếm nhanh nhân viên theo từ khóa (Admin/HR)
    /// </summary>
    [HttpGet("search")]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<List<NhanVienDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        var result = await _nhanVienService.SearchAsync(keyword);
        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết thông tin nhân viên theo mã (Admin/HR hoặc chính nhân viên đó)
    /// </summary>
    [HttpGet("{maNV}")]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string maNV)
    {
        var result = await _nhanVienService.GetByIdAsync(maNV, User);
        if (!result.Success)
        {
            if (result.Message.Contains("quyền"))
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Thêm nhân viên mới (gọi SP SP_ThemNhanVien tự động sinh mã an toàn - Admin/HR)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateNhanVienDto dto)
    {
        var result = await _nhanVienService.CreateAsync(dto, User);
        if (!result.Success)
        {
            if (result.Message.Contains("tồn tại"))
                return Conflict(result);

            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { maNV = result.Data!.MaNV }, result);
    }

    /// <summary>
    /// Cập nhật thông tin nhân viên (Admin/HR)
    /// </summary>
    [HttpPut("{maNV}")]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<NhanVienDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string maNV, [FromBody] UpdateNhanVienDto dto)
    {
        var result = await _nhanVienService.UpdateAsync(maNV, dto, User);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa mềm nhân viên chuyển trạng thái sang Nghỉ việc (Chỉ Admin)
    /// </summary>
    [HttpDelete("{maNV}")]
    [Authorize(Roles = RoleConstants.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string maNV)
    {
        var result = await _nhanVienService.DeleteAsync(maNV, User);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);

            return BadRequest(result);
        }

        return NoContent();
    }
}
