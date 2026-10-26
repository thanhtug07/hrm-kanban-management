using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.NghiPhep;

namespace HRM.Core.Interfaces;

public interface INghiPhepService
{
    Task<ApiResponse<NghiPhepDto>> CreateAsync(CreateNghiPhepDto dto, ClaimsPrincipal user);
    Task<ApiResponse<List<NghiPhepDto>>> GetMyLeavesAsync(ClaimsPrincipal user);
    Task<ApiResponse<List<NghiPhepDto>>> GetAllLeavesAsync(string? trangThai, string? maNV);
    Task<ApiResponse<NghiPhepDto>> DuyetAsync(int id, DuyetNghiPhepDto dto, ClaimsPrincipal user);
    Task<ApiResponse<bool>> DeleteAsync(int id, ClaimsPrincipal user);
}
