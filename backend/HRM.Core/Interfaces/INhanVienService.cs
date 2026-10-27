using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.NhanVien;

namespace HRM.Core.Interfaces;

public interface INhanVienService
{
    Task<ApiResponse<PagedResult<NhanVienDto>>> GetListAsync(NhanVienFilterDto filter, ClaimsPrincipal user);
    Task<ApiResponse<NhanVienDto>> GetByIdAsync(string maNV, ClaimsPrincipal user);
    Task<ApiResponse<NhanVienDto>> CreateAsync(CreateNhanVienDto dto, ClaimsPrincipal user);
    Task<ApiResponse<NhanVienDto>> UpdateAsync(string maNV, UpdateNhanVienDto dto, ClaimsPrincipal user);
    Task<ApiResponse<bool>> DeleteAsync(string maNV, ClaimsPrincipal user);
    Task<ApiResponse<List<NhanVienDto>>> SearchAsync(string keyword, ClaimsPrincipal user);
}
