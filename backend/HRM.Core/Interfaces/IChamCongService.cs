using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.ChamCong;

namespace HRM.Core.Interfaces;

public interface IChamCongService
{
    Task<ApiResponse<ChamCongDto>> CheckInAsync(ClaimsPrincipal user);
    Task<ApiResponse<ChamCongDto>> CheckOutAsync(ClaimsPrincipal user);
    Task<ApiResponse<List<ChamCongDto>>> GetMyAttendanceAsync(int? thang, int? nam, ClaimsPrincipal user);
    Task<ApiResponse<List<ChamCongDto>>> GetListAsync(ChamCongFilterDto filter, ClaimsPrincipal user);
    Task<ApiResponse<ChamCongDto>> UpdateAsync(int id, UpdateChamCongDto dto);
    Task<ApiResponse<CauHinhChamCongDto>> GetCauHinhDtoAsync();
    Task<ApiResponse<CauHinhChamCongDto>> UpdateCauHinhAsync(UpdateCauHinhChamCongDto dto);
}
