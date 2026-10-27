using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.TaiKhoan;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.Application.Services;

public class TaiKhoanService : ITaiKhoanService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<TaiKhoanService> _logger;
    private static readonly string[] ValidRoles = { "Admin", "HR", "NhanVien" };

    public TaiKhoanService(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<TaiKhoanService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<TaiKhoanDto>>> GetAllAsync(string? search, string? vaiTro, int page, int pageSize)
    {
        var query = _context.TaiKhoans
            .AsNoTracking()
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var kw = search.Trim().ToLower();
            query = query.Where(t => t.TenDangNhap.ToLower().Contains(kw)
                || (t.NhanVien != null && t.NhanVien.HoTen.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(vaiTro))
            query = query.Where(t => t.VaiTro == vaiTro.Trim());

        var totalCount = await query.CountAsync();
        var pageSafe = page > 0 ? page : 1;
        var sizeSafe = Math.Clamp(pageSize > 0 ? pageSize : 20, 1, 100);

        var accounts = await query
            .OrderByDescending(t => t.NgayTao)
            .Skip((pageSafe - 1) * sizeSafe)
            .Take(sizeSafe)
            .Select(t => new TaiKhoanDto
            {
                MaTK = t.MaTK,
                TenDangNhap = t.TenDangNhap,
                VaiTro = t.VaiTro,
                MaNV = t.MaNV,
                HoTen = t.NhanVien != null ? t.NhanVien.HoTen : null,
                TenPB = t.NhanVien != null && t.NhanVien.PhongBan != null ? t.NhanVien.PhongBan.TenPB : null,
                TenCV = t.NhanVien != null && t.NhanVien.ChucVu != null ? t.NhanVien.ChucVu.TenCV : null,
                Email = t.NhanVien != null ? t.NhanVien.Email : null,
                TrangThai = t.TrangThai,
                NgayTao = t.NgayTao
            })
            .ToListAsync();

        var paged = PagedResult<TaiKhoanDto>.Create(accounts, totalCount, pageSafe, sizeSafe);
        return ApiResponse<PagedResult<TaiKhoanDto>>.Ok(paged);
    }

    public async Task<ApiResponse<TaiKhoanDto>> CreateAsync(CreateTaiKhoanDto dto, ClaimsPrincipal user)
    {
        if (string.IsNullOrWhiteSpace(dto.TenDangNhap))
            return ApiResponse<TaiKhoanDto>.Fail("Vui lòng nhập tên đăng nhập cho tài khoản.");

        var username = dto.TenDangNhap.Trim().ToLower();

        var vaiTroMoi = string.IsNullOrWhiteSpace(dto.VaiTro) ? "NhanVien" : dto.VaiTro.Trim();
        if (!ValidRoles.Contains(vaiTroMoi))
            return ApiResponse<TaiKhoanDto>.Fail("Vai trò không hợp lệ (chỉ nhận Admin, HR, NhanVien).");

        // Chỉ Admin được tạo tài khoản có vai trò Admin
        if (vaiTroMoi == "Admin" && !user.IsInRole("Admin"))
            return ApiResponse<TaiKhoanDto>.Fail("Chỉ Admin được tạo tài khoản vai trò Admin.", ErrorCode.Forbidden);

        if (await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap.ToLower() == username))
            return ApiResponse<TaiKhoanDto>.Fail($"Tên đăng nhập '{dto.TenDangNhap}' đã tồn tại trong hệ thống.", ErrorCode.Conflict);

        string? validMaNV = null;
        NhanVien? linkedEmp = null;

        if (!string.IsNullOrWhiteSpace(dto.MaNV))
        {
            var emp = await _context.NhanViens
                .Include(n => n.PhongBan)
                .Include(n => n.ChucVu)
                .FirstOrDefaultAsync(n => n.MaNV == dto.MaNV);

            if (emp != null)
            {
                if (await _context.TaiKhoans.AnyAsync(t => t.MaNV == dto.MaNV))
                    return ApiResponse<TaiKhoanDto>.Fail($"Nhân viên {emp.HoTen} ({dto.MaNV}) đã có tài khoản trong hệ thống.", ErrorCode.Conflict);
                validMaNV = emp.MaNV;
                linkedEmp = emp;
            }
        }

        var plainPassword = string.IsNullOrWhiteSpace(dto.MatKhau) ? "Hrm@123456" : dto.MatKhau.Trim();
        var account = new TaiKhoan
        {
            TenDangNhap = username,
            MatKhauHash = _passwordHasher.HashPassword(plainPassword),
            VaiTro = vaiTroMoi,
            MaNV = validMaNV,
            TrangThai = true,
            NgayTao = DateTime.Now
        };

        _context.TaiKhoans.Add(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountCreated: Username={Username}, MaNV={MaNV}, Role={Role}",
            account.TenDangNhap, account.MaNV, account.VaiTro);

        var resultDto = MapToDto(account, linkedEmp);
        return ApiResponse<TaiKhoanDto>.Ok(resultDto, "Cấp tài khoản mới thành công!");
    }

    public async Task<ApiResponse<TaiKhoanDto>> UpdateAsync(int id, UpdateTaiKhoanDto dto, ClaimsPrincipal user)
    {
        var account = await _context.TaiKhoans
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.PhongBan)
            .Include(t => t.NhanVien)
                .ThenInclude(nv => nv!.ChucVu)
            .FirstOrDefaultAsync(t => t.MaTK == id);

        if (account == null)
            return ApiResponse<TaiKhoanDto>.Fail("Tài khoản không tồn tại.", ErrorCode.NotFound);

        if (account.VaiTro == "Admin" && !user.IsInRole("Admin"))
            return ApiResponse<TaiKhoanDto>.Fail("Chỉ Admin được thao tác lên tài khoản Admin.", ErrorCode.Forbidden);

        // 1. Đổi tên đăng nhập
        if (!string.IsNullOrWhiteSpace(dto.TenDangNhap))
        {
            var newUsername = dto.TenDangNhap.Trim().ToLower();
            if (newUsername != account.TenDangNhap.ToLower())
            {
                if (await _context.TaiKhoans.AnyAsync(t => t.MaTK != id && t.TenDangNhap.ToLower() == newUsername))
                    return ApiResponse<TaiKhoanDto>.Fail($"Tên đăng nhập '{dto.TenDangNhap}' đã được sử dụng bởi tài khoản khác.", ErrorCode.Conflict);
                account.TenDangNhap = newUsername;
            }
        }

        // 2. Đổi mật khẩu
        if (!string.IsNullOrWhiteSpace(dto.MatKhauMoi))
        {
            account.MatKhauHash = _passwordHasher.HashPassword(dto.MatKhauMoi.Trim());
            _logger.LogInformation("PasswordChanged: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        }

        // 3. Đổi vai trò
        if (!string.IsNullOrWhiteSpace(dto.VaiTro))
        {
            var vaiTroMoi = dto.VaiTro.Trim();
            if (!ValidRoles.Contains(vaiTroMoi))
                return ApiResponse<TaiKhoanDto>.Fail("Vai trò không hợp lệ (chỉ nhận Admin, HR, NhanVien).");
            if (vaiTroMoi == "Admin" && !user.IsInRole("Admin"))
                return ApiResponse<TaiKhoanDto>.Fail("Chỉ Admin được gán vai trò Admin.", ErrorCode.Forbidden);
            account.VaiTro = vaiTroMoi;
        }

        // 4. Đổi nhân viên liên kết
        if (dto.MaNV != null)
        {
            var newMaNV = string.IsNullOrWhiteSpace(dto.MaNV) ? null : dto.MaNV.Trim();
            if (newMaNV != account.MaNV)
            {
                if (newMaNV != null)
                {
                    var emp = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaNV == newMaNV);
                    if (emp == null)
                        return ApiResponse<TaiKhoanDto>.Fail($"Mã nhân viên '{newMaNV}' không tồn tại.", ErrorCode.NotFound);
                    if (await _context.TaiKhoans.AnyAsync(t => t.MaTK != id && t.MaNV == newMaNV))
                        return ApiResponse<TaiKhoanDto>.Fail($"Nhân viên {emp.HoTen} ({newMaNV}) đã liên kết với tài khoản khác.", ErrorCode.Conflict);
                }
                account.MaNV = newMaNV;
            }
        }

        await _context.SaveChangesAsync();

        // Tải lại quan hệ
        await _context.Entry(account).Reference(t => t.NhanVien).LoadAsync();
        if (account.NhanVien != null)
        {
            await _context.Entry(account.NhanVien).Reference(nv => nv.PhongBan).LoadAsync();
            await _context.Entry(account.NhanVien).Reference(nv => nv.ChucVu).LoadAsync();
        }

        return ApiResponse<TaiKhoanDto>.Ok(MapToDto(account), "Cập nhật thông tin tài khoản thành công!");
    }

    public async Task<ApiResponse<bool>> UpdateStatusAsync(int id, bool trangThai, ClaimsPrincipal user)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
            return ApiResponse<bool>.Fail("Tài khoản không tồn tại.", ErrorCode.NotFound);

        if (account.VaiTro == "Admin" && !user.IsInRole("Admin"))
            return ApiResponse<bool>.Fail("Chỉ Admin được khóa/mở tài khoản Admin.", ErrorCode.Forbidden);

        var currentUserIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id && !trangThai)
            return ApiResponse<bool>.Fail("Bạn không thể tự khóa tài khoản của chính mình.");

        account.TrangThai = trangThai;
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountStatusChanged: MaTK={MaTK}, NewStatus={NewStatus}", id, trangThai);
        return ApiResponse<bool>.Ok(true, trangThai ? "Đã kích hoạt tài khoản." : "Đã khóa tài khoản.");
    }

    public async Task<ApiResponse<bool>> ResetPasswordAsync(int id, string? matKhauMoi, ClaimsPrincipal user)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
            return ApiResponse<bool>.Fail("Tài khoản không tồn tại.", ErrorCode.NotFound);

        if (account.VaiTro == "Admin" && !user.IsInRole("Admin"))
            return ApiResponse<bool>.Fail("Chỉ Admin được reset mật khẩu tài khoản Admin.", ErrorCode.Forbidden);

        var newPassword = string.IsNullOrWhiteSpace(matKhauMoi) ? "Hrm@123456" : matKhauMoi;
        account.MatKhauHash = _passwordHasher.HashPassword(newPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountPasswordReset: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        return ApiResponse<bool>.Ok(true, $"Đã đặt lại mật khẩu của tài khoản '{account.TenDangNhap}' về mật khẩu mặc định!");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id, ClaimsPrincipal user)
    {
        var account = await _context.TaiKhoans.FindAsync(id);
        if (account == null)
            return ApiResponse<bool>.Fail("Tài khoản không tồn tại.", ErrorCode.NotFound);

        var currentUserIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id)
            return ApiResponse<bool>.Fail("Bạn không thể xóa tài khoản của chính mình.");

        _context.TaiKhoans.Remove(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("AccountDeleted: MaTK={MaTK}, Username={Username}", id, account.TenDangNhap);
        return ApiResponse<bool>.Ok(true, "Đã xóa tài khoản thành công!");
    }

    private static TaiKhoanDto MapToDto(TaiKhoan t, NhanVien? emp = null) => new()
    {
        MaTK = t.MaTK,
        TenDangNhap = t.TenDangNhap,
        VaiTro = t.VaiTro,
        MaNV = t.MaNV,
        HoTen = emp?.HoTen ?? t.NhanVien?.HoTen,
        TenPB = emp?.PhongBan?.TenPB ?? t.NhanVien?.PhongBan?.TenPB,
        TenCV = emp?.ChucVu?.TenCV ?? t.NhanVien?.ChucVu?.TenCV,
        Email = emp?.Email ?? t.NhanVien?.Email,
        TrangThai = t.TrangThai,
        NgayTao = t.NgayTao
    };
}
