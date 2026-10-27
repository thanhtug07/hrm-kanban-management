using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Controllers;

/// <summary>
/// Health check — CHỈ Admin được xem (không lộ cấu trúc/đếm bảng cho người ngoài).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.Admin)]
public class HealthCheckController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<HealthCheckController> _logger;

    public HealthCheckController(AppDbContext context, ILogger<HealthCheckController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabaseConnection()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                _logger.LogWarning("HealthCheck: Không kết nối được CSDL");
                return StatusCode(503, ApiResponse<object>.Fail("Không kết nối được cơ sở dữ liệu.", ErrorCode.ServerError));
            }

            return Ok(ApiResponse<object>.Ok(new { database = "healthy", timestamp = DateTime.Now }));
        }
        catch (Exception ex)
        {
            // KHÔNG trả chi tiết exception ra ngoài
            _logger.LogError(ex, "HealthCheck: Lỗi kiểm tra kết nối CSDL");
            return StatusCode(503, ApiResponse<object>.Fail("Cơ sở dữ liệu không sẵn sàng.", ErrorCode.ServerError));
        }
    }
}
