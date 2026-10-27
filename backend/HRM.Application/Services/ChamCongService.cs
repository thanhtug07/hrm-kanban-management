using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
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
        var existing = await _context.ChamCongs.FirstOrDefaultAsync(c => c.MaNV == maNV && c.Ngay == today);
        if (existing != null)
            return ApiResponse<ChamCongDto>.Fail($"Bạn đã check-in hôm nay lúc {existing.GioVao:HH:mm:ss}.");

        // Kiểm tra khung giờ cho phép check-in
        var cfg = await GetCauHinhAsync();
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);
        if (nowTime < cfg.GioBatDau)
        {
            var earliest = cfg.GioBatDau.AddMinutes(-cfg.PhutChoPhepSom);
            if (nowTime < earliest)
                return ApiResponse<ChamCongDto>.Fail($"Chưa đến giờ check-in. Ca bắt đầu {cfg.GioBatDau:HH:mm}, chỉ được check-in sớm tối đa {cfg.PhutChoPhepSom} phút (từ {earliest:HH:mm}).");
        }

        var latest = cfg.GioKetThuc.AddMinutes(cfg.PhutChoPhepTre);
        if (nowTime > latest)
            return ApiResponse<ChamCongDto>.Fail($"Đã quá giờ check-in. Ca kết thúc {cfg.GioKetThuc:HH:mm}" + (cfg.PhutChoPhepTre > 0 ? $" (cho phép trễ tối đa {cfg.PhutChoPhepTre} phút, hạn {latest:HH:mm})" : "") + ".");

        var trangThai = nowTime > cfg.GioBatDau ? "Trễ" : "Đủ công";

        var chamCong = new ChamCong
        {
            MaNV = maNV, Ngay = today, GioVao = nowTime, GioRa = null, TrangThai = trangThai
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
        var existing = await _context.ChamCongs.FirstOrDefaultAsync(c => c.MaNV == maNV && c.Ngay == today);
        if (existing == null)
            return ApiResponse<ChamCongDto>.Fail("Bạn chưa check-in ngày hôm nay.");
        if (existing.GioRa.HasValue)
            return ApiResponse<ChamCongDto>.Fail($"Bạn đã check-out hôm nay lúc {existing.GioRa.Value:HH:mm:ss}.");

        // Kiểm tra khung giờ cho phép check-out
        var cfg = await GetCauHinhAsync();
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);
        if (cfg.BatBuocCheckOutSauKetThuc && nowTime < cfg.GioKetThuc)
            return ApiResponse<ChamCongDto>.Fail($"Chưa hết giờ làm việc. Chỉ được check-out sau {cfg.GioKetThuc:HH:mm}.");

        existing.GioRa = nowTime;
        await _context.SaveChangesAsync();
        _logger.LogInformation("CheckOut: MaNV={MaNV}, Time={Time}", maNV, nowTime);

        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == maNV);
        return ApiResponse<ChamCongDto>.Ok(MapToDto(existing, nv?.HoTen), "Check-out thành công.");
    }

    public async Task<ApiResponse<CauHinhChamCongDto>> GetCauHinhDtoAsync()
    {
        var cfg = await GetCauHinhAsync();
        return ApiResponse<CauHinhChamCongDto>.Ok(MapCauHinh(cfg));
    }

    public async Task<ApiResponse<CauHinhChamCongDto>> UpdateCauHinhAsync(UpdateCauHinhChamCongDto dto)
    {
        if (dto.GioKetThuc <= dto.GioBatDau)
            return ApiResponse<CauHinhChamCongDto>.Fail("Giờ kết thúc phải sau giờ bắt đầu.");
        if (dto.PhutChoPhepSom < 0 || dto.PhutChoPhepSom > 120)
            return ApiResponse<CauHinhChamCongDto>.Fail("Phút cho phép sớm phải từ 0 đến 120.");
        if (dto.PhutChoPhepTre < 0 || dto.PhutChoPhepTre > 120)
            return ApiResponse<CauHinhChamCongDto>.Fail("Phút cho phép trễ phải từ 0 đến 120.");

        var cfg = await _context.CauHinhChamCongs.FirstOrDefaultAsync();
        if (cfg == null)
        {
            cfg = new CauHinhChamCong();
            _context.CauHinhChamCongs.Add(cfg);
        }
        cfg.GioBatDau = dto.GioBatDau;
        cfg.GioKetThuc = dto.GioKetThuc;
        cfg.PhutChoPhepSom = dto.PhutChoPhepSom;
        cfg.PhutChoPhepTre = dto.PhutChoPhepTre;
        cfg.BatBuocCheckOutSauKetThuc = dto.BatBuocCheckOutSauKetThuc;
        cfg.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        _logger.LogInformation("UpdateCauHinhChamCong: {BatDau}-{KetThuc}, som={Som}, tre={Tre}", dto.GioBatDau, dto.GioKetThuc, dto.PhutChoPhepSom, dto.PhutChoPhepTre);
        return ApiResponse<CauHinhChamCongDto>.Ok(MapCauHinh(cfg), "Cập nhật cấu hình giờ chấm công thành công.");
    }

    private async Task<CauHinhChamCong> GetCauHinhAsync()
    {
        var cfg = await _context.CauHinhChamCongs.AsNoTracking().FirstOrDefaultAsync();
        return cfg ?? new CauHinhChamCong { GioBatDau = new TimeOnly(8, 0), GioKetThuc = new TimeOnly(17, 30), PhutChoPhepSom = 15, PhutChoPhepTre = 0, BatBuocCheckOutSauKetThuc = true };
    }

    private static CauHinhChamCongDto MapCauHinh(CauHinhChamCong c) => new()
    {
        MaCH = c.MaCH, GioBatDau = c.GioBatDau, GioKetThuc = c.GioKetThuc,
        PhutChoPhepSom = c.PhutChoPhepSom, PhutChoPhepTre = c.PhutChoPhepTre,
        BatBuocCheckOutSauKetThuc = c.BatBuocCheckOutSauKetThuc, NgayCapNhat = c.NgayCapNhat
    };

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

    public async Task<ApiResponse<List<ChamCongDto>>> GetListAsync(ChamCongFilterDto filter, ClaimsPrincipal user)
    {
        var query = _context.ChamCongs
            .AsNoTracking()
            .Include(c => c.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .AsQueryable();

        // Trưởng phòng: chỉ xem chấm công của nhân viên thuộc phòng mình
        var managedPB = await GetManagedDepartmentAsync(user);
        if (managedPB != null)
            query = query.Where(c => c.NhanVien != null && c.NhanVien.MaPB == managedPB);

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

    private async Task<string?> GetManagedDepartmentAsync(ClaimsPrincipal user)
    {
        if (user.FindFirstValue(ClaimTypes.Role) != RoleConstants.TruongPhong) return null;
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV)) return null;
        return await _context.PhongBans.AsNoTracking()
            .Where(p => p.MaNV_QL == maNV.Trim()).Select(p => p.MaPB).FirstOrDefaultAsync();
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
