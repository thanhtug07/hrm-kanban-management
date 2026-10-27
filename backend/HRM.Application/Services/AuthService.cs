using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.Auth;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.Application.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext _context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtService,
        ILogger<AuthService> logger)
    {
        this._context = _context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var username = request.TenDangNhap.Trim();
        var user = await _context.TaiKhoans
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .FirstOrDefaultAsync(t => t.TenDangNhap == username);

        // Chống leak thông tin: Nếu user không tồn tại hoặc tài khoản bị khóa -> trả về lỗi chung
        if (user == null || !user.TrangThai)
        {
            _logger.LogWarning("LoginFail: Username={Username}, Reason=UserNotFoundOrDisabled", username);
            return ApiResponse<LoginResponseDto>.Fail("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        if (!_passwordHasher.Verify(request.MatKhau, user.MatKhauHash))
        {
            _logger.LogWarning("LoginFail: Username={Username}, Reason=InvalidPassword", username);
            return ApiResponse<LoginResponseDto>.Fail("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        var (token, expiresAt) = _jwtService.GenerateToken(user, user.NhanVien);

        var profile = new UserProfileDto
        {
            MaTK = user.MaTK,
            TenDangNhap = user.TenDangNhap,
            VaiTro = user.VaiTro,
            MaNV = user.MaNV ?? user.NhanVien?.MaNV ?? string.Empty,
            HoTen = user.NhanVien?.HoTen ?? user.TenDangNhap,
            MaPB = user.NhanVien?.MaPB ?? string.Empty,
            TenPB = user.NhanVien?.PhongBan?.TenPB ?? string.Empty,
            MaCV = user.NhanVien?.MaCV ?? string.Empty,
            TenCV = user.NhanVien?.ChucVu?.TenCV ?? string.Empty,
            Email = user.NhanVien?.Email ?? string.Empty,
            SDT = user.NhanVien?.SDT ?? string.Empty
        };

        _logger.LogInformation("LoginSuccess: Username={Username}, Role={Role}, MaNV={MaNV}", 
            user.TenDangNhap, user.VaiTro, profile.MaNV);

        var response = new LoginResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresAt = expiresAt,
            UserProfile = profile
        };

        return ApiResponse<LoginResponseDto>.Ok(response, "Đăng nhập thành công");
    }

    public async Task<ApiResponse<UserProfileDto>> GetProfileAsync(ClaimsPrincipal user)
    {
        var maTkStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(maTkStr, out var maTk))
        {
            return ApiResponse<UserProfileDto>.Fail("Không xác định được danh tính người dùng.");
        }

        var dbUser = await _context.TaiKhoans
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .FirstOrDefaultAsync(t => t.MaTK == maTk);

        if (dbUser == null)
        {
            return ApiResponse<UserProfileDto>.Fail("Tài khoản không tồn tại trên hệ thống.");
        }

        var profile = new UserProfileDto
        {
            MaTK = dbUser.MaTK,
            TenDangNhap = dbUser.TenDangNhap,
            VaiTro = dbUser.VaiTro,
            MaNV = dbUser.MaNV ?? dbUser.NhanVien?.MaNV ?? string.Empty,
            HoTen = dbUser.NhanVien?.HoTen ?? dbUser.TenDangNhap,
            MaPB = dbUser.NhanVien?.MaPB ?? string.Empty,
            TenPB = dbUser.NhanVien?.PhongBan?.TenPB ?? string.Empty,
            MaCV = dbUser.NhanVien?.MaCV ?? string.Empty,
            TenCV = dbUser.NhanVien?.ChucVu?.TenCV ?? string.Empty,
            Email = dbUser.NhanVien?.Email ?? string.Empty,
            SDT = dbUser.NhanVien?.SDT ?? string.Empty
        };

        return ApiResponse<UserProfileDto>.Ok(profile);
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(ChangePasswordDto request, ClaimsPrincipal user)
    {
        var maTkStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(maTkStr, out var maTk))
        {
            return ApiResponse<bool>.Fail("Không xác định được danh tính người dùng.");
        }

        var dbUser = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.MaTK == maTk);
        if (dbUser == null)
        {
            return ApiResponse<bool>.Fail("Tài khoản không tồn tại.");
        }

        if (!_passwordHasher.Verify(request.MatKhauCu, dbUser.MatKhauHash))
        {
            return ApiResponse<bool>.Fail("Mật khẩu hiện tại không chính xác.");
        }

        dbUser.MatKhauHash = _passwordHasher.HashPassword(request.MatKhauMoi);
        await _context.SaveChangesAsync();

        _logger.LogInformation("PasswordChanged: Username={Username}", dbUser.TenDangNhap);

        return ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công.");
    }
}
