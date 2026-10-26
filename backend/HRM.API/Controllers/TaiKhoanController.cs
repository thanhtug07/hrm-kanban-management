using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.TaiKhoan;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR")]
public class TaiKhoanController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<TaiKhoanController> _logger;

    public TaiKhoanController(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<TaiKhoanController> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách toàn bộ tài khoản người dùng
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<TaiKhoanDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await _context.TaiKhoans
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .OrderByDescending(t => t.NgayTao)
            .Select(t => new TaiKhoanDto
            {
                MaTK = t.MaTK,
                TenDangNhap = t.TenDangNhap,
                VaiTro = t.VaiTro,
                MaNV = t.MaNV,
                HoTen = t.NhanVien != null ? t.NhanVien.HoTen : null,
                TenPB = t.NhanVien != null && t.NhanVien.PhongBan != null ? t.NhanVien.PhongBan.TenPB : null,
                TenCV = t.NhanVien != null && t.NhanVien.ChucVu != null ? t.NhanVien.ChucVu.TenCV : null,
                Email = t.NhanVien != null ? t.NhanVien.Email : null,
                TrangThai = t.TrangThai,
                NgayTao = t.NgayTao
            })
            .ToListAsync();

        return Ok(ApiResponse<List<TaiKhoanDto>>.Ok(accounts));
    }

    /// <summary>
    /// Cấp tài khoản mới (Nhân viên được cấp là tùy ý, có thể chọn hoặc không cần có trong DS công ty)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TaiKhoanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Create([FromBody] CreateTaiKhoanDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            return BadRequest(ApiResponse<TaiKhoanDto>.Fail("Vui lòng nhập tên đăng nhập cho tài khoản."));
        }

        var username = dto.TenDangNhap.Trim().ToLower();

        // Chỉ Admin được tạo tài khoản có vai trò Admin
        if (!string.IsNullOrWhiteSpace(dto.VaiTro)
            && dto.VaiTro.Equals("Admin", StringComparison.OrdinalIgnoreCase)
            && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // Kiểm tra trùng tên đăng nhập
        if (await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username))
        {
            return BadRequest(ApiResponse<TaiKhoanDto>.Fail($"Tên đăng nhập '{dto.TenDangNhap}' đã tồn tại trong hệ thống."));
        }

        string? validMaNV = null;
        NhanVien? linkedEmp = null;

        // Nếu người dùng có chọn liên kết nhân viên trong công ty
        if (!string.IsNullOrWhiteSpace(dto.MaNV))
        {
            var emp = await _context.NhanViens
                .Include(n => n.PhongBan)
                .Include(n => n.ChucVu)
                .FirstOrDefaultAsync(n => n.MaNV == dto.MaNV);

            if (emp != null)
            {
                // Kiểm tra xem nhân viên này đã có tài khoản chưa
                if (await _context.TaiKhoans.AnyAsync(t => t.MaNV == dto.MaNV))
                {
                    return BadRequest(ApiResponse<TaiKhoanDto>.Fail($"Nhân viên {emp.HoTen} ({dto.MaNV}) đã có tài khoản trong hệ thống."));
                }
                validMaNV = emp.MaNV;
                linkedEmp = emp;
            }
        }

        var plainPassword = string.IsNullOrWhiteSpace(dto.MatKhau) ? "Hrm@123456" : dto.MatKhau.Trim();
        var hash = _passwordHasher.HashPassword(plainPassword);

        var account = new TaiKhoan
        {
            TenDangNhap = username,
            MatKhauHash = hash,
            VaiTro = !string.IsNullOrWhiteSpace(dto.VaiTro) ? dto.VaiTro : "NhanVien",
            MaNV = validMaNV, // Nullable nếu không liên kết nhân viên công ty
            TrangThai = true,
            NgayTao = DateTime.Now
        };

        _context.TaiKhoans.Add(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountCreated: Username={Username}, MaNV={MaNV}, Role={Role}", account.TenDangNhap, account.MaNV, account.VaiTro);

        var resultDto = new TaiKhoanDto
        {
            MaTK = account.MaTK,
            TenDangNhap = account.TenDangNhap,
            VaiTro = account.VaiTro,
            MaNV = account.MaNV,
            HoTen = linkedEmp?.HoTen,
            TenPB = linkedEmp?.PhongBan?.TenPB,
            TenCV = linkedEmp?.ChucVu?.TenCV,
            Email = linkedEmp?.Email,
            TrangThai = account.TrangThai,
            NgayTao = account.NgayTao
        };

        return Ok(ApiResponse<TaiKhoanDto>.Ok(resultDto, "Cấp tài khoản mới thành công!"));
    }

    /// <summary>
    /// Chỉnh sửa tài khoản tùy ý: Đổi tên đăng nhập, đổi mật khẩu tùy ý, đổi vai trò
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaiKhoanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaiKhoanDto dto)
    {
        var account = await _context.TaiKhoans
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .FirstOrDefaultAsync(t => t.MaTK == id);

        if (account == null)
        {
            return NotFound(ApiResponse<TaiKhoanDto>.Fail("Tài khoản không tồn tại."));
        }

        // Chỉ Admin được thao tác lên tài khoản có vai trò Admin
        if (account.VaiTro == "Admin" && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // 1. Đổi tên đăng nhập nếu có
        if (!string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            var newUsername = dto.TenDangNhap.Trim().ToLower();
            if (newUsername != account.TenDangNhap.ToLower())
            {
                if (await _context.TaiKhoans.AnyAsync(t => t.MaTK != id && t.TenDangNhap.ToLower() == newUsername))
                {
                    return BadRequest(ApiResponse<TaiKhoanDto>.Fail($"Tên đăng nhập '{dto.TenDangNhap}' đã được sử dụng bởi tài khoản khác."));
                }
                account.TenDangNhap = newUsername;
            }
        }

        // 2. Đổi mật khẩu tùy ý nếu có nhập
        if (!string.IsNullOrWhiteSpace(dto.MatKhauMoi))
        {
            account.MatKhauHash = _passwordHasher.HashPassword(dto.MatKhauMoi.Trim());
            _logger.LogInformation("PasswordChanged: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        }

        // 3. Đổi vai trò nếu có
        if (!string.IsNullOrWhiteSpace(dto.VaiTro))
        {
            // Chỉ Admin được gán vai trò Admin (chống leo thang đặc quyền)
            if (dto.VaiTro.Equals("Admin", StringComparison.OrdinalIgnoreCase) && !User.IsInRole("Admin"))
            {
                return Forbid();
            }
            account.VaiTro = dto.VaiTro;
        }

        // 4. Đổi nhân viên liên kết nếu có
        if (dto.MaNV != null)
        {
            var newMaNV = string.IsNullOrWhiteSpace(dto.MaNV) ? null : dto.MaNV.Trim();
            if (newMaNV != account.MaNV)
            {
                if (newMaNV != null)
                {
                    var emp = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaNV == newMaNV);
                    if (emp == null)
                    {
                        return BadRequest(ApiResponse<TaiKhoanDto>.Fail($"Mã nhân viên '{newMaNV}' không tồn tại."));
                    }
                    if (await _context.TaiKhoans.AnyAsync(t => t.MaTK != id && t.MaNV == newMaNV))
                    {
                        return BadRequest(ApiResponse<TaiKhoanDto>.Fail($"Nhân viên {emp.HoTen} ({newMaNV}) đã liên kết với tài khoản khác."));
                    }
                }
                account.MaNV = newMaNV;
            }
        }

        await _context.SaveChangesAsync();

        // Tải lại quan hệ
        await _context.Entry(account).Reference(t => t.NhanVien).LoadAsync();
        if (account.NhanVien != null)
        {
            await _context.Entry(account.NhanVien).Reference(nv => nv.PhongBan).LoadAsync();
            await _context.Entry(account.NhanVien).Reference(nv => nv.ChucVu).LoadAsync();
        }

        var resultDto = new TaiKhoanDto
        {
            MaTK = account.MaTK,
            TenDangNhap = account.TenDangNhap,
            VaiTro = account.VaiTro,
            MaNV = account.MaNV,
            HoTen = account.NhanVien?.HoTen,
            TenPB = account.NhanVien?.PhongBan?.TenPB,
            TenCV = account.NhanVien?.ChucVu?.TenCV,
            Email = account.NhanVien?.Email,
            TrangThai = account.TrangThai,
            NgayTao = account.NgayTao
        };

        return Ok(ApiResponse<TaiKhoanDto>.Ok(resultDto, "Cập nhật thông tin tài khoản thành công!"));
    }

    /// <summary>
    /// Bật/Tắt trạng thái hoạt động của tài khoản
    /// </summary>
    [HttpPut("{id:int}/trangthai")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTrangThaiDto dto)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Tài khoản không tồn tại."));
        }

        // Chỉ Admin được khóa/mở tài khoản có vai trò Admin
        if (account.VaiTro == "Admin" && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id && !dto.TrangThai)
        {
            return BadRequest(ApiResponse<bool>.Fail("Bạn không thể tự khóa tài khoản của chính mình."));
        }

        account.TrangThai = dto.TrangThai;
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountStatusChanged: MaTK={MaTK}, NewStatus={NewStatus}", id, dto.TrangThai);
        return Ok(ApiResponse<bool>.Ok(true, dto.TrangThai ? "Đã kích hoạt tài khoản." : "Đã khóa tài khoản."));
    }

    /// <summary>
    /// Đặt lại mật khẩu về mặc định
    /// </summary>
    [HttpPut("{id:int}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Tài khoản không tồn tại."));
        }

        // Chỉ Admin được reset mật khẩu tài khoản có vai trò Admin
        if (account.VaiTro == "Admin" && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var newPassword = string.IsNullOrWhiteSpace(dto?.MatKhauMoi) ? "Hrm@123456" : dto.MatKhauMoi;
        account.MatKhauHash = _passwordHasher.HashPassword(newPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountPasswordReset: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        return Ok(ApiResponse<bool>.Ok(true, $"Đã đặt lại mật khẩu của tài khoản '{account.TenDangNhap}' về mật khẩu mặc định!"));
    }

    /// <summary>
    /// Xóa tài khoản (Chỉ Admin)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
        {
            return NotFound(ApiResponse<bool>.Fail("Tài khoản không tồn tại."));
        }

        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id)
        {
            return BadRequest(ApiResponse<bool>.Fail("Bạn không thể xóa tài khoản của chính mình."));
        }

        _context.TaiKhoans.Remove(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountDeleted: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa tài khoản thành công!"));
    }
}
