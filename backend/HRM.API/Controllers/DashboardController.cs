using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.Dashboard;
using HRM.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Thống kê tổng hợp toàn diện công ty (Chỉ Admin và HR)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = RoleConstants.AdminOrHR)]
    [ProducesResponseType(typeof(ApiResponse<DashboardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _dashboardService.GetDashboardSummaryAsync();
        return Ok(result);
    }

    /// <summary>
    /// Thống kê cá nhân (Task của tôi, đơn nghỉ phép, công tháng, lương tháng gần nhất)
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<DashboardCaNhanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDashboard()
    {
        var result = await _dashboardService.GetMyDashboardAsync(User);
        return Ok(result);
    }
}
