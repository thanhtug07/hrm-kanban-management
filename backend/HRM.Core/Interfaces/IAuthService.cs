using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.Auth;

namespace HRM.Core.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<UserProfileDto>> GetProfileAsync(ClaimsPrincipal user);
    Task<ApiResponse<bool>> ChangePasswordAsync(ChangePasswordDto request, ClaimsPrincipal user);
}
