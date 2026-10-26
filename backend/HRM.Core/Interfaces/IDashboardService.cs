using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.Dashboard;

namespace HRM.Core.Interfaces;

public interface IDashboardService
{
    Task<ApiResponse<DashboardDto>> GetDashboardSummaryAsync();
    Task<ApiResponse<DashboardCaNhanDto>> GetMyDashboardAsync(ClaimsPrincipal user);
}
