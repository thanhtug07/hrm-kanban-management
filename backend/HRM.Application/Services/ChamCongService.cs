using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.ChamCong;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.Application.Services;

public class ChamCongService : IChamCongService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ChamCongService> _logger;

    public ChamCongService(AppDbContext context, ILogger<ChamCongService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<ChamCongDto>> CheckInAsync(ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<ChamCongDto>.Fail("Không xác định được mã nhân viên từ tài khoản.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        var existing = await _context.ChamCongs
            .FirstOrDefaultAsync(c => c.MaNV == maNV && c.Ngay == today);

        if (existing != null)
        {
            return ApiResponse<ChamCongDto>.Fail($"Bạn đã check-in hôm nay lúc {existing.GioVao:HH:mm:ss}.");
        }

        var nowTime = TimeOnly.FromDateTime(DateTime.Now);
        var trangThai = nowTime > new TimeOnly(8, 30) ? "Trễ" : "Đủ công";

        var chamCong = new ChamCong
        {
            MaNV = maNV,
            Ngay = today,
            GioVao = nowTime,
            GioRa = null,
            TrangThai = trangThai
        };

        _context.ChamCongs.Add(chamCong);
        await _context.SaveChangesAsync();

        _logger.LogInformation("CheckIn: MaNV={MaNV}, Time={Time}, Status={Status}", maNV, nowTime, trangThai);

        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == maNV);

        return ApiResponse<ChamCongDto>.Ok(MapToDto(chamCong, nv?.HoTen), "Check-in thành công.");
    }

    public async Task<ApiResponse<ChamCongDto>> CheckOutAsync(ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<ChamCongDto>.Fail("Không xác định được mã nhân viên.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        var existing = await _context.ChamCongs
            .FirstOrDefaultAsync(c => c.MaNV == maNV && c.Ngay == today);

        if (existing == null)
        {
            return ApiResponse<ChamCongDto>.Fail("Bạn chưa check-in ngày hôm nay.");
        }

        if (existing.GioRa.HasValue)
        {
            return ApiResponse<ChamCongDto>.Fail($"Bạn đã check-out hôm nay lúc {existing.GioRa.Value:HH:mm:ss}.");
        }

        var nowTime = TimeOnly.FromDateTime(DateTime.Now);
        existing.GioRa = nowTime;
        await _context.SaveChangesAsync();

        _logger.LogInformation("CheckOut: MaNV={MaNV}, Time={Time}", maNV, nowTime);

        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == maNV);
        return ApiResponse<ChamCongDto>.Ok(MapToDto(existing, nv?.HoTen), "Check-out thành công.");
    }

    public async Task<ApiResponse<List<ChamCongDto>>> GetMyAttendanceAsync(int? thang, int? nam, ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<List<ChamCongDto>>.Fail("Không xác định được mã nhân viên.");

        var targetThang = thang ?? DateTime.Today.Month;
        var targetNam = nam ?? DateTime.Today.Year;

        var items = await _context.ChamCongs
            .AsNoTracking()
            .Include(c => c.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .Where(c => c.MaNV == maNV && c.Ngay.Month == targetThang && c.Ngay.Year == targetNam)
            .OrderByDescending(c => c.Ngay)
            .Select(c => MapToDto(c, c.NhanVien != null ? c.NhanVien.HoTen : maNV, c.NhanVien != null && c.NhanVien.PhongBan != null ? c.NhanVien.PhongBan.TenPB : null))
            .ToListAsync();

        return ApiResponse<List<ChamCongDto>>.Ok(items);
    }

    public async Task<ApiResponse<List<ChamCongDto>>> GetListAsync(ChamCongFilterDto filter)
    {
        var query = _context.ChamCongs
            .AsNoTracking()
            .Include(c => c.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.MaNV))
            query = query.Where(c => c.MaNV == filter.MaNV.Trim());

        if (!string.IsNullOrWhiteSpace(filter.MaPB))
            query = query.Where(c => c.NhanVien != null && c.NhanVien.MaPB == filter.MaPB.Trim());

        if (filter.Thang.HasValue)
            query = query.Where(c => c.Ngay.Month == filter.Thang.Value);

        if (filter.Nam.HasValue)
            query = query.Where(c => c.Ngay.Year == filter.Nam.Value);

        if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            query = query.Where(c => c.TrangThai == filter.TrangThai.Trim());

        var items = await query
            .OrderByDescending(c => c.Ngay)
            .Take(1000)
            .Select(c => MapToDto(c, c.NhanVien != null ? c.NhanVien.HoTen : c.MaNV, c.NhanVien != null && c.NhanVien.PhongBan != null ? c.NhanVien.PhongBan.TenPB : null))
            .ToListAsync();

        return ApiResponse<List<ChamCongDto>>.Ok(items);
    }

    public async Task<ApiResponse<ChamCongDto>> UpdateAsync(int id, UpdateChamCongDto dto)
    {
        var cc = await _context.ChamCongs.Include(c => c.NhanVien).ThenInclude(n => n.PhongBan).FirstOrDefaultAsync(c => c.MaCC == id);
        if (cc == null)
            return ApiResponse<ChamCongDto>.Fail("Bản ghi chấm công không tồn tại.");

        cc.GioVao = dto.GioVao;
        cc.GioRa = dto.GioRa;
        cc.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();
        return ApiResponse<ChamCongDto>.Ok(MapToDto(cc, cc.NhanVien?.HoTen, cc.NhanVien?.PhongBan?.TenPB), "Cập nhật bản ghi chấm công thành công.");
    }

    private static ChamCongDto MapToDto(ChamCong c, string? hoTen, string? tenPB = null) => new()
    {
        MaCC = c.MaCC,
        MaNV = c.MaNV,
        HoTen = hoTen ?? c.MaNV,
        TenPhongBan = tenPB ?? c.NhanVien?.PhongBan?.TenPB,
        Ngay = c.Ngay,
        GioVao = c.GioVao,
        GioRa = c.GioRa,
        TrangThai = c.TrangThai
    };
}
