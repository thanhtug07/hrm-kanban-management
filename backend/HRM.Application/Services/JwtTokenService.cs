using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRM.Core.Constants;
using HRM.Core.DTOs.Auth;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace HRM.Application.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string Token, DateTime ExpiresAt) GenerateToken(TaiKhoan user, NhanVien? nhanVien)
    {
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
            ?? _config["JwtSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
            throw new InvalidOperationException("JWT SecretKey chưa được cấu hình (JWT_SECRET_KEY hoặc JwtSettings:SecretKey).");
        var issuer = _config["JwtSettings:Issuer"] ?? "HRM.API";
        var audience = _config["JwtSettings:Audience"] ?? "HRM.Client";
        var expirationHours = int.TryParse(_config["JwtSettings:ExpirationHours"], out var h) ? h : 8;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Normalize VaiTro
        var role = user.VaiTro?.Trim() switch
        {
            "Admin" => RoleConstants.Admin,
            "HR" => RoleConstants.HR,
            "TruongPhong" => RoleConstants.TruongPhong,
            "NhanVien" => RoleConstants.NhanVien,
            _ => RoleConstants.NhanVien
        };

        var maNv = user.MaNV ?? nhanVien?.MaNV ?? string.Empty;
        var hoTen = nhanVien?.HoTen ?? user.TenDangNhap;
        var maPb = nhanVien?.MaPB ?? string.Empty;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.MaTK.ToString()),
            new(ClaimTypes.Name, user.TenDangNhap),
            new(ClaimTypes.Role, role),
            new("MaNV", maNv),
            new("HoTen", hoTen),
            new("MaPB", maPb),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expiresAt = DateTime.UtcNow.AddHours(expirationHours);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
