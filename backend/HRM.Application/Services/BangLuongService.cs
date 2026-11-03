using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.BangLuong;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.Application.Services;

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



        // Gom nhóm 1 lần bằng Lookup -> tra cứu O(1)
        var psLookup = phatSinhs.ToLookup(p => p.MaNV);
        foreach (var item in items)
        {
            var empPs = psLookup[item.MaNV].ToList();
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
        var psByKy = empPs.ToLookup(p => (p.Thang, p.Nam));
        foreach (var item in items)
        {
            var matchedPs = psByKy[(item.Thang, item.Nam)].ToList();
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
            return ApiResponse<BangLuongDto>.Fail("Bạn không có quyền xem bảng lương của nhân viên khác.", ErrorCode.Forbidden);
        }

        // Trưởng phòng: chỉ xem bảng lương của nhân viên trong phòng mình
        var managedPB = await GetManagedDepartmentAsync(user);
        if (managedPB != null)
        {
            var empPB = await _context.NhanViens.AsNoTracking()
                .Where(n => n.MaNV == maNV.Trim()).Select(n => n.MaPB).FirstOrDefaultAsync();
            if (empPB != managedPB)
                return ApiResponse<BangLuongDto>.Fail("Bạn chỉ được xem bảng lương của nhân viên thuộc phòng mình phụ trách.", ErrorCode.Forbidden);
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

        // Bọc transaction + atomic update để tránh lost-update khi nhiều request đồng thời.
        // Phải chạy qua execution strategy vì EnableRetryOnFailure không cho phép transaction do người dùng khởi tạo.
        var strategy = _context.Database.CreateExecutionStrategy();
        try
        {
            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                _context.ChiPhiPhatSinhs.Add(ps);

                var loai = dto.Loai.Trim();
                var maNV = dto.MaNV.Trim();
                bool isThuong = loai == "Thưởng" || loai == "Công tác phí";
                bool isPhat = loai == "Phạt" || loai == "Ứng lương";

                // Cập nhật atomic vào BangLuong tương ứng (nếu có) — chỉ 1 lệnh SQL, không đọc-rồi-ghi
                int affected = 0;
                if (isThuong)
                {
                    affected = await _context.BangLuongs
                        .Where(b => b.MaNV == maNV && b.Thang == dto.Thang && b.Nam == dto.Nam)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.PhuCap, b => b.PhuCap + dto.SoTien));
                }
                else if (isPhat)
                {
                    affected = await _context.BangLuongs
                        .Where(b => b.MaNV == maNV && b.Thang == dto.Thang && b.Nam == dto.Nam)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.KhauTru, b => b.KhauTru + dto.SoTien));
                }

                // 0 dòng = chưa có bảng lương kỳ này -> hoàn tác, tránh ghi phát sinh mồ côi
                if (affected == 0)
                {
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    return ApiResponse<ChiPhiPhatSinhDto>.Fail(
                        $"Chưa có bảng lương kỳ {dto.Thang}/{dto.Nam} cho nhân viên '{maNV}' nên không thể áp dụng khoản phát sinh.");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("CreatePhatSinh: MaNV={MaNV}, Loai={Loai}, SoTien={SoTien}, Ky={Thang}/{Nam}",
                    dto.MaNV, dto.Loai, dto.SoTien, dto.Thang, dto.Nam);

                return ApiResponse<ChiPhiPhatSinhDto>.Ok(MapToPhatSinhDto(ps, nv.HoTen), "Thêm chi phí phát sinh thành công.");
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreatePhatSinhFailed: MaNV={MaNV}, Ky={Thang}/{Nam}", dto.MaNV, dto.Thang, dto.Nam);
            return ApiResponse<ChiPhiPhatSinhDto>.Fail("Thêm chi phí phát sinh thất bại, đã hoàn tác thay đổi.");
        }
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
            .Take(5000)  // ponytail: cap an toàn cho 1 kỳ toàn công ty; chuyển PagedResult nếu vượt
            .Select(p => MapToPhatSinhDto(p, p.NhanVien != null ? p.NhanVien.HoTen : p.MaNV))
            .ToListAsync();

        return ApiResponse<List<ChiPhiPhatSinhDto>>.Ok(items);
    }

    private async Task<string?> GetManagedDepartmentAsync(ClaimsPrincipal user)
    {
        if (user.FindFirstValue(ClaimTypes.Role) != RoleConstants.TruongPhong) return null;
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV)) return null;
        return await _context.PhongBans.AsNoTracking()
            .Where(p => p.MaNV_QL == maNV.Trim()).Select(p => p.MaPB).FirstOrDefaultAsync();
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
