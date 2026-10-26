using HRM.Core.DTOs.Auth;
using HRM.Core.Entities;

namespace HRM.Core.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(TaiKhoan user, NhanVien? nhanVien);
}
