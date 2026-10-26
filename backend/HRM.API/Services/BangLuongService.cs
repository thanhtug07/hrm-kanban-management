using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.BangLuong;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Services;

public class BangLuongService : IBangLuongService
{
    private readonly AppDbContext _context;
    private readonly ILogger<BangLuongService> _logger;

    public BangLuongService(AppDbContext context, ILogger<BangLuongService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<TinhLuongResultDto>> TinhLuongAsync(TinhLuongRequestDto request)
    {
        var rawResult = await _context.Database
            .SqlQueryRaw<TinhLuongResultDto>(
                "EXEC dbo.SP_TinhLuongThang @Thang = {0}, @Nam = {1}",
                request.Thang, request.Nam)
            .ToListAsync();

        var result = rawResult.FirstOrDefault() ?? new TinhLuongResultDto
        {
            Thang = request.Thang,
            Nam = request.Nam,
            SoNhanVienTinhLuong = 0
        };

        _logger.LogInformation("TinhLuongThang: Thang={Thang}, Nam={Nam}, SoNV={SoNV}",
            request.Thang, request.Nam, result.SoNhanVienTinhLuong);

        return ApiResponse<TinhLuongResultDto>.Ok(result, $"Tính lương tháng {request.Thang}/{request.Nam} thành công cho {result.SoNhanVienTinhLuong} nhân viên.");
    }

    public async Task<ApiResponse<List<BangLuongDto>>> GetListAsync(int? thang, int? nam)
    {
        var query = _context.BangLuongs
            .AsNoTracking()
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.ChucVu)
            .AsQueryable();

        if (thang.HasValue)
            query = query.Where(b => b.Thang == thang.Value);

        if (nam.HasValue)
            query = query.Where(b => b.Nam == nam.Value);

        var items = await query
            .OrderBy(b => b.MaNV)
            .Select(b => MapToDto(b))
            .ToListAsync();

        // Lấy danh sách phát sinh trong tháng/năm
        var psQuery = _context.ChiPhiPhatSinhs.AsNoTracking().AsQueryable();
        if (thang.HasValue) psQuery = psQuery.Where(p => p.Thang == thang.Value);
        if (nam.HasValue) psQuery = psQuery.Where(p => p.Nam == nam.Value);
        var phatSinhs = await psQuery.ToListAsync();

        foreach (var item in items)
        {
            var empPs = phatSinhs.Where(p => p.MaNV == item.MaNV).ToList();
            item.ChiPhiPhatSinhs = empPs.Select(p => MapToPhatSinhDto(p, item.HoTen)).ToList();
            item.ThuongPhatSinh = empPs.Where(p => p.Loai == "Thưởng" || p.Loai == "Công tác phí").Sum(p => p.SoTien);
            item.PhatKhauTru = empPs.Where(p => p.Loai == "Phạt" || p.Loai == "Ứng lương").Sum(p => p.SoTien);
        }

        return ApiResponse<List<BangLuongDto>>.Ok(items);
    }

    public async Task<ApiResponse<List<BangLuongDto>>> GetMyPayrollAsync(ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<List<BangLuongDto>>.Fail("Không xác định được mã nhân viên.");

        var items = await _context.BangLuongs
            .AsNoTracking()
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.ChucVu)
            .Where(b => b.MaNV == maNV)
            .OrderByDescending(b => b.Nam)
            .ThenByDescending(b => b.Thang)
            .Take(12)
            .Select(b => MapToDto(b))
            .ToListAsync();

        var empPs = await _context.ChiPhiPhatSinhs.AsNoTracking().Where(p => p.MaNV == maNV).ToListAsync();
        foreach (var item in items)
        {
            var matchedPs = empPs.Where(p => p.Thang == item.Thang && p.Nam == item.Nam).ToList();
            item.ChiPhiPhatSinhs = matchedPs.Select(p => MapToPhatSinhDto(p, item.HoTen)).ToList();
            item.ThuongPhatSinh = matchedPs.Where(p => p.Loai == "Thưởng" || p.Loai == "Công tác phí").Sum(p => p.SoTien);
            item.PhatKhauTru = matchedPs.Where(p => p.Loai == "Phạt" || p.Loai == "Ứng lương").Sum(p => p.SoTien);
        }

        return ApiResponse<List<BangLuongDto>>.Ok(items);
    }

    public async Task<ApiResponse<BangLuongDto>> GetDetailAsync(string maNV, int thang, int nam, ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        if (role == RoleConstants.NhanVien && maNV.Trim() != userMaNV?.Trim())
        {
            return ApiResponse<BangLuongDto>.Fail("Bạn không có quyền xem bảng lương của nhân viên khác.");
        }

        var bl = await _context.BangLuongs
            .AsNoTracking()
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.PhongBan)
            .Include(b => b.NhanVien)
                .ThenInclude(n => n.ChucVu)
            .FirstOrDefaultAsync(b => b.MaNV == maNV.Trim() && b.Thang == thang && b.Nam == nam);

        if (bl == null)
        {
            return ApiResponse<BangLuongDto>.Fail($"Không tìm thấy bảng lương của nhân viên '{maNV}' kỳ {thang}/{nam}.");
        }

        var dto = MapToDto(bl);
        var empPs = await _context.ChiPhiPhatSinhs.AsNoTracking()
            .Where(p => p.MaNV == maNV.Trim() && p.Thang == thang && p.Nam == nam)
            .ToListAsync();

        dto.ChiPhiPhatSinhs = empPs.Select(p => MapToPhatSinhDto(p, dto.HoTen)).ToList();
        dto.ThuongPhatSinh = empPs.Where(p => p.Loai == "Thưởng" || p.Loai == "Công tác phí").Sum(p => p.SoTien);
        dto.PhatKhauTru = empPs.Where(p => p.Loai == "Phạt" || p.Loai == "Ứng lương").Sum(p => p.SoTien);

        return ApiResponse<BangLuongDto>.Ok(dto);
    }

    public async Task<ApiResponse<ChiPhiPhatSinhDto>> CreatePhatSinhAsync(CreateChiPhiPhatSinhDto dto)
    {
        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == dto.MaNV.Trim());
        if (nv == null)
            return ApiResponse<ChiPhiPhatSinhDto>.Fail($"Nhân viên '{dto.MaNV}' không tồn tại.");

        var ps = new ChiPhiPhatSinh
        {
            MaNV = dto.MaNV.Trim(),
            Loai = dto.Loai.Trim(),
            SoTien = dto.SoTien,
            LyDo = dto.LyDo?.Trim(),
            Thang = dto.Thang,
            Nam = dto.Nam,
            NgayTao = DateTime.Now
        };

        _context.ChiPhiPhatSinhs.Add(ps);

        // Cập nhật vào BangLuong tương ứng nếu có
        var bl = await _context.BangLuongs.FirstOrDefaultAsync(b => b.MaNV == dto.MaNV.Trim() && b.Thang == dto.Thang && b.Nam == dto.Nam);
        if (bl != null)
        {
            if (dto.Loai == "Thưởng" || dto.Loai == "Công tác phí")
            {
                bl.PhuCap += dto.SoTien;
            }
            else if (dto.Loai == "Phạt" || dto.Loai == "Ứng lương")
            {
                bl.KhauTru += dto.SoTien;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("CreatePhatSinh: MaNV={MaNV}, Loai={Loai}, SoTien={SoTien}, Ky={Thang}/{Nam}",
            dto.MaNV, dto.Loai, dto.SoTien, dto.Thang, dto.Nam);

        return ApiResponse<ChiPhiPhatSinhDto>.Ok(MapToPhatSinhDto(ps, nv.HoTen), "Thêm chi phí phát sinh thành công.");
    }

    public async Task<ApiResponse<List<ChiPhiPhatSinhDto>>> GetPhatSinhListAsync(string? maNV, int? thang, int? nam)
    {
        var query = _context.ChiPhiPhatSinhs.AsNoTracking().Include(p => p.NhanVien).AsQueryable();

        if (!string.IsNullOrWhiteSpace(maNV))
            query = query.Where(p => p.MaNV == maNV.Trim());

        if (thang.HasValue)
            query = query.Where(p => p.Thang == thang.Value);

        if (nam.HasValue)
            query = query.Where(p => p.Nam == nam.Value);

        var items = await query
            .OrderByDescending(p => p.NgayTao)
            .Select(p => MapToPhatSinhDto(p, p.NhanVien != null ? p.NhanVien.HoTen : p.MaNV))
            .ToListAsync();

        return ApiResponse<List<ChiPhiPhatSinhDto>>.Ok(items);
    }

    private static ChiPhiPhatSinhDto MapToPhatSinhDto(ChiPhiPhatSinh p, string hoTen) => new()
    {
        MaPS = p.MaPS,
        MaNV = p.MaNV,
        HoTen = hoTen,
        Loai = p.Loai,
        SoTien = p.SoTien,
        LyDo = p.LyDo,
        Thang = p.Thang,
        Nam = p.Nam,
        NgayTao = p.NgayTao
    };

    private static BangLuongDto MapToDto(BangLuong b) => new()
    {
        MaBL = b.MaBL,
        MaNV = b.MaNV,
        HoTen = b.NhanVien != null ? b.NhanVien.HoTen : b.MaNV,
        TenPB = b.NhanVien?.PhongBan != null ? b.NhanVien.PhongBan.TenPB : string.Empty,
        TenCV = b.NhanVien?.ChucVu != null ? b.NhanVien.ChucVu.TenCV : string.Empty,
        Thang = b.Thang,
        Nam = b.Nam,
        SoNgayCong = b.SoNgayCong,
        LuongCoBan = b.LuongCoBan,
        PhuCap = b.PhuCap,
        KhauTru = b.KhauTru,
        ThucLinh = b.ThucLinh
    };
}
