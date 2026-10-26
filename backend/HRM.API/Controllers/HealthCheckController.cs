using HRM.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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
                return StatusCode(503, new
                {
                    success = false,
                    database = "QUANLYNHANSU",
                    connected = false,
                    message = "Không thể kết nối đến SQL Server!"
                });
            }

            // Đếm số lượng record thực tế trên CSDL
            var phongBanCount = await _context.PhongBans.CountAsync();
            var chucVuCount = await _context.ChucVus.CountAsync();
            var nhanVienCount = await _context.NhanViens.CountAsync();
            var congViecCount = await _context.CongViecs.CountAsync(); // Tự động áp dụng filter DaXoa = false
            var bangLuongCount = await _context.BangLuongs.CountAsync();
            var taiKhoanCount = await _context.TaiKhoans.CountAsync();

            _logger.LogInformation("Kiểm tra kết nối CSDL thành công: NV={NV}, Task={Task}", nhanVienCount, congViecCount);

            return Ok(new
            {
                success = true,
                database = "QUANLYNHANSU",
                connected = true,
                counts = new
                {
                    phongBan = phongBanCount,
                    chucVu = chucVuCount,
                    nhanVien = nhanVienCount,
                    congViec = congViecCount,
                    bangLuong = bangLuongCount,
                    taiKhoan = taiKhoanCount
                },
                message = "Kết nối CSDL QUANLYNHANSU và cấu hình EF Core 8 thành công 100%!"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra kết nối CSDL");
            return StatusCode(500, new
            {
                success = false,
                database = "QUANLYNHANSU",
                connected = false,
                error = ex.Message
            });
        }
    }
}
