using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.BangLuong;

namespace HRM.Core.Interfaces;

public interface IBangLuongService
{
    Task<ApiResponse<TinhLuongResultDto>> TinhLuongAsync(TinhLuongRequestDto request);
    Task<ApiResponse<List<BangLuongDto>>> GetListAsync(int? thang, int? nam);
    Task<ApiResponse<List<BangLuongDto>>> GetMyPayrollAsync(ClaimsPrincipal user);
    Task<ApiResponse<BangLuongDto>> GetDetailAsync(string maNV, int thang, int nam, ClaimsPrincipal user);
    Task<ApiResponse<ChiPhiPhatSinhDto>> CreatePhatSinhAsync(CreateChiPhiPhatSinhDto dto);
    Task<ApiResponse<List<ChiPhiPhatSinhDto>>> GetPhatSinhListAsync(string? maNV, int? thang, int? nam);
}
