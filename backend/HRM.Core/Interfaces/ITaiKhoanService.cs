using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.TaiKhoan;

namespace HRM.Core.Interfaces;

public interface ITaiKhoanService
{
    Task<ApiResponse<PagedResult<TaiKhoanDto>>> GetAllAsync(string? search, string? vaiTro, int page, int pageSize);
    Task<ApiResponse<TaiKhoanDto>> CreateAsync(CreateTaiKhoanDto dto, ClaimsPrincipal user);
    Task<ApiResponse<TaiKhoanDto>> UpdateAsync(int id, UpdateTaiKhoanDto dto, ClaimsPrincipal user);
    Task<ApiResponse<bool>> UpdateStatusAsync(int id, bool trangThai, ClaimsPrincipal user);
    Task<ApiResponse<bool>> ResetPasswordAsync(int id, string? matKhauMoi, ClaimsPrincipal user);
    Task<ApiResponse<bool>> DeleteAsync(int id, ClaimsPrincipal user);
}
