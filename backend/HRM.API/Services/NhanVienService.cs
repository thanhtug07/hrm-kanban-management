using System.Data;
using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.NhanVien;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Services;

public class NhanVienService : INhanVienService
{
    private readonly AppDbContext _context;
    private readonly ILogger<NhanVienService> _logger;

    public NhanVienService(AppDbContext context, ILogger<NhanVienService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<NhanVienDto>>> GetListAsync(NhanVienFilterDto filter)
    {
        var query = _context.NhanViens
            .AsNoTracking()
            .Include(n => n.PhongBan)
            .Include(n => n.ChucVu)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.MaPB))
            query = query.Where(n => n.MaPB == filter.MaPB.Trim());

        if (!string.IsNullOrWhiteSpace(filter.MaCV))
            query = query.Where(n => n.MaCV == filter.MaCV.Trim());

        if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            query = query.Where(n => n.TrangThai == filter.TrangThai.Trim());

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(n => n.HoTen.ToLower().Contains(search) 
                                  || (n.Email != null && n.Email.ToLower().Contains(search))
                                  || (n.SDT != null && n.SDT.Contains(search))
                                  || n.CCCD.Contains(search));
        }

        var totalCount = await query.CountAsync();

        // Sắp xếp
        query = (filter.SortBy?.ToLower(), filter.SortDir?.ToLower()) switch
        {
            ("hoten", "desc") => query.OrderByDescending(n => n.HoTen),
            ("ngayvaolam", "desc") => query.OrderByDescending(n => n.NgayVaoLam),
            ("ngayvaolam", "asc") => query.OrderBy(n => n.NgayVaoLam),
            ("manv", "desc") => query.OrderByDescending(n => n.MaNV),
            ("manv", "asc") => query.OrderBy(n => n.MaNV),
            _ => query.OrderBy(n => n.HoTen)
        };

        var page = filter.Page > 0 ? filter.Page : 1;
        var pageSize = Math.Clamp(filter.PageSize > 0 ? filter.PageSize : 20, 1, 100);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => MapToDto(n))
            .ToListAsync();

        var pagedResult = PagedResult<NhanVienDto>.Create(items, totalCount, page, pageSize);
        return ApiResponse<PagedResult<NhanVienDto>>.Ok(pagedResult);
    }

    public async Task<ApiResponse<NhanVienDto>> GetByIdAsync(string maNV, ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        if (role == RoleConstants.NhanVien && maNV.Trim() != userMaNV?.Trim())
        {
            return ApiResponse<NhanVienDto>.Fail("Bạn không có quyền xem thông tin của nhân viên khác.", ErrorCode.Forbidden);
        }

        var nv = await _context.NhanViens
            .AsNoTracking()
            .Include(n => n.PhongBan)
            .Include(n => n.ChucVu)
            .FirstOrDefaultAsync(n => n.MaNV == maNV.Trim());

        if (nv == null)
            return ApiResponse<NhanVienDto>.Fail($"Không tìm thấy nhân viên với mã '{maNV}'.", ErrorCode.NotFound);

        return ApiResponse<NhanVienDto>.Ok(MapToDto(nv));
    }

    public async Task<ApiResponse<NhanVienDto>> CreateAsync(CreateNhanVienDto dto, ClaimsPrincipal user)
    {
        if (!await _context.PhongBans.AnyAsync(p => p.MaPB == dto.MaPB))
            return ApiResponse<NhanVienDto>.Fail($"Phòng ban '{dto.MaPB}' không tồn tại.");

        if (!await _context.ChucVus.AnyAsync(c => c.MaCV == dto.MaCV))
            return ApiResponse<NhanVienDto>.Fail($"Chức vụ '{dto.MaCV}' không tồn tại.");

        if (await _context.NhanViens.AnyAsync(n => n.CCCD == dto.CCCD.Trim()))
            return ApiResponse<NhanVienDto>.Fail($"Số CCCD '{dto.CCCD}' đã tồn tại trong hệ thống.", ErrorCode.Conflict);

        var maNVParam = new SqlParameter
        {
            ParameterName = "@MaNVmoi",
            SqlDbType = SqlDbType.Char,
            Size = 5,
            Direction = ParameterDirection.Output
        };

        // Chạy Stored Procedure sinh mã và chèn an toàn chống race condition
        var p = new List<SqlParameter>
        {
            new("@HoTen", SqlDbType.NVarChar, 100) { Value = dto.HoTen.Trim() },
            new("@GioiTinh", SqlDbType.NVarChar, 5) { Value = dto.GioiTinh },
            new("@NgaySinh", SqlDbType.Date) { Value = dto.NgaySinh.ToDateTime(TimeOnly.MinValue) },
            new("@CCCD", SqlDbType.Char, 12) { Value = dto.CCCD.Trim() },
            new("@SDT", SqlDbType.VarChar, 15) { Value = (object?)dto.SDT?.Trim() ?? DBNull.Value },
            new("@Email", SqlDbType.VarChar, 100) { Value = (object?)dto.Email?.Trim() ?? DBNull.Value },
            new("@DiaChi", SqlDbType.NVarChar, 255) { Value = (object?)dto.DiaChi?.Trim() ?? DBNull.Value },
            new("@MaPB", SqlDbType.Char, 5) { Value = dto.MaPB },
            new("@MaCV", SqlDbType.Char, 5) { Value = dto.MaCV },
            new("@NgayVaoLam", SqlDbType.Date) { Value = dto.NgayVaoLam.ToDateTime(TimeOnly.MinValue) },
            maNVParam
        };

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC dbo.SP_ThemNhanVien @HoTen=@HoTen, @GioiTinh=@GioiTinh, @NgaySinh=@NgaySinh, " +
            "@CCCD=@CCCD, @SDT=@SDT, @Email=@Email, @DiaChi=@DiaChi, @MaPB=@MaPB, @MaCV=@MaCV, " +
            "@NgayVaoLam=@NgayVaoLam, @MaNVmoi=@MaNVmoi OUTPUT",
            p);

        var maNVMoi = (maNVParam.Value?.ToString() ?? string.Empty).Trim();

        _logger.LogInformation("NhanVienCreated: MaNV={MaNV}, CreatedBy={CreatedBy}",
            maNVMoi, user.FindFirstValue(ClaimTypes.Name));

        var created = await _context.NhanViens
            .AsNoTracking()
            .Include(n => n.PhongBan)
            .Include(n => n.ChucVu)
            .FirstAsync(n => n.MaNV == maNVMoi);

        return ApiResponse<NhanVienDto>.Ok(MapToDto(created), "Tạo nhân viên mới thành công.");
    }

    public async Task<ApiResponse<NhanVienDto>> UpdateAsync(string maNV, UpdateNhanVienDto dto, ClaimsPrincipal user)
    {
        var nv = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaNV == maNV.Trim());
        if (nv == null)
            return ApiResponse<NhanVienDto>.Fail($"Không tìm thấy nhân viên với mã '{maNV}'.", ErrorCode.NotFound);

        if (!await _context.PhongBans.AnyAsync(p => p.MaPB == dto.MaPB))
            return ApiResponse<NhanVienDto>.Fail($"Phòng ban '{dto.MaPB}' không tồn tại.");

        if (!await _context.ChucVus.AnyAsync(c => c.MaCV == dto.MaCV))
            return ApiResponse<NhanVienDto>.Fail($"Chức vụ '{dto.MaCV}' không tồn tại.");

        if (await _context.NhanViens.AnyAsync(n => n.CCCD == dto.CCCD.Trim() && n.MaNV != nv.MaNV))
            return ApiResponse<NhanVienDto>.Fail($"Số CCCD '{dto.CCCD}' đã được sử dụng bởi nhân viên khác.", ErrorCode.Conflict);

        nv.HoTen = dto.HoTen.Trim();
        nv.GioiTinh = dto.GioiTinh;
        nv.NgaySinh = dto.NgaySinh;
        nv.CCCD = dto.CCCD.Trim();
        nv.SDT = dto.SDT?.Trim();
        nv.Email = dto.Email?.Trim();
        nv.DiaChi = dto.DiaChi?.Trim();
        nv.MaPB = dto.MaPB;
        nv.MaCV = dto.MaCV;
        nv.NgayVaoLam = dto.NgayVaoLam;
        nv.TrangThai = dto.TrangThai;

        await _context.SaveChangesAsync();

        var updated = await _context.NhanViens
            .AsNoTracking()
            .Include(n => n.PhongBan)
            .Include(n => n.ChucVu)
            .FirstAsync(n => n.MaNV == nv.MaNV);

        return ApiResponse<NhanVienDto>.Ok(MapToDto(updated), "Cập nhật thông tin nhân viên thành công.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(string maNV, ClaimsPrincipal user)
    {
        var cleanMaNV = maNV.Trim();
        var nv = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaNV == cleanMaNV);
        if (nv == null)
            return ApiResponse<bool>.Fail($"Không tìm thấy nhân viên '{cleanMaNV}'.", ErrorCode.NotFound);

        // Kiểm tra ràng buộc: Có tài khoản đang hoạt động không?
        var hasActiveAccount = await _context.TaiKhoans.AnyAsync(t => t.MaNV == cleanMaNV && t.TrangThai);
        if (hasActiveAccount)
        {
            return ApiResponse<bool>.Fail("Nhân viên đang có tài khoản hoạt động. Vui lòng vô hiệu hóa tài khoản trước khi xóa nhân viên.");
        }

        // Kiểm tra ràng buộc: Đang làm trưởng phòng không?
        var isManager = await _context.PhongBans.AnyAsync(p => p.MaNV_QL == cleanMaNV);
        if (isManager)
        {
            return ApiResponse<bool>.Fail("Nhân viên đang là quản lý phòng ban. Vui lòng bàn giao quyền quản lý trước khi xóa nhân viên.");
        }

        // Soft delete: Chuyển trạng thái sang "Nghỉ việc"
        nv.TrangThai = "Nghỉ việc";
        await _context.SaveChangesAsync();

        _logger.LogInformation("NhanVienDeleted: MaNV={MaNV}, DeletedBy={DeletedBy}",
            cleanMaNV, user.FindFirstValue(ClaimTypes.Name));

        return ApiResponse<bool>.Ok(true, "Xóa nhân viên thành công (đã chuyển trạng thái Nghỉ việc).");
    }

    public async Task<ApiResponse<List<NhanVienDto>>> SearchAsync(string keyword)
    {
        var search = (keyword ?? string.Empty).Trim().ToLower();
        var items = await _context.NhanViens
            .AsNoTracking()
            .Include(n => n.PhongBan)
            .Include(n => n.ChucVu)
            .Where(n => n.HoTen.ToLower().Contains(search)
                     || n.MaNV.ToLower().Contains(search)
                     || (n.Email != null && n.Email.ToLower().Contains(search))
                     || (n.SDT != null && n.SDT.Contains(search)))
            .Take(20)
            .Select(n => MapToDto(n))
            .ToListAsync();

        return ApiResponse<List<NhanVienDto>>.Ok(items);
    }

    private static NhanVienDto MapToDto(NhanVien n) => new()
    {
        MaNV = n.MaNV,
        HoTen = n.HoTen,
        GioiTinh = n.GioiTinh,
        NgaySinh = n.NgaySinh,
        CCCD = n.CCCD,
        SDT = n.SDT,
        Email = n.Email,
        DiaChi = n.DiaChi,
        MaPB = n.MaPB,
        TenPB = n.PhongBan != null ? n.PhongBan.TenPB : string.Empty,
        MaCV = n.MaCV,
        TenCV = n.ChucVu != null ? n.ChucVu.TenCV : string.Empty,
        NgayVaoLam = n.NgayVaoLam,
        TrangThai = n.TrangThai
    };
}
