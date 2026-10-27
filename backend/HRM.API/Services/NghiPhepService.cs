using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.NghiPhep;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Services;

public class NghiPhepService : INghiPhepService
{
    private readonly AppDbContext _context;
    private readonly ILogger<NghiPhepService> _logger;

    public NghiPhepService(AppDbContext context, ILogger<NghiPhepService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<NghiPhepDto>> CreateAsync(CreateNghiPhepDto dto, ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<NghiPhepDto>.Fail("Không xác định được mã nhân viên từ tài khoản.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        if (dto.TuNgay < today)
        {
            return ApiResponse<NghiPhepDto>.Fail("Không thể gửi đơn nghỉ phép cho ngày trong quá khứ.");
        }

        // Kiểm tra trùng lặp khoảng thời gian với đơn khác (overlap 2 khoảng ngày)
        var hasOverlap = await _context.NghiPheps
            .AnyAsync(n => n.MaNV == maNV 
                        && n.TrangThai != "Từ chối"
                        && dto.TuNgay <= n.DenNgay
                        && dto.DenNgay >= n.TuNgay);

        if (hasOverlap)
        {
            return ApiResponse<NghiPhepDto>.Fail("Khoảng thời gian nghỉ này bị trùng với một đơn nghỉ phép khác của bạn.");
        }

        var don = new NghiPhep
        {
            MaNV = maNV,
            LoaiPhep = dto.LoaiPhep,
            TuNgay = dto.TuNgay,
            DenNgay = dto.DenNgay,
            LyDo = dto.LyDo?.Trim(),
            TrangThai = "Chờ duyệt"
        };

        _context.NghiPheps.Add(don);
        await _context.SaveChangesAsync();

        _logger.LogInformation("NghiPhepCreated: MaNP={MaNP}, MaNV={MaNV}, Loai={Loai}", don.MaNP, maNV, dto.LoaiPhep);

        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == maNV);
        return ApiResponse<NghiPhepDto>.Ok(MapToDto(don, nv?.HoTen, null), "Gửi đơn nghỉ phép thành công.");
    }

    public async Task<ApiResponse<List<NghiPhepDto>>> GetMyLeavesAsync(ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<List<NghiPhepDto>>.Fail("Không xác định được mã nhân viên.");

        var items = await _context.NghiPheps
            .AsNoTracking()
            .Include(n => n.NhanVien)
            .Include(n => n.NhanVienDuyet)
            .Where(n => n.MaNV == maNV)
            .OrderByDescending(n => n.TuNgay)
            .Select(n => MapToDto(n, n.NhanVien != null ? n.NhanVien.HoTen : maNV, n.NhanVienDuyet != null ? n.NhanVienDuyet.HoTen : null))
            .ToListAsync();

        return ApiResponse<List<NghiPhepDto>>.Ok(items);
    }

    public async Task<ApiResponse<List<NghiPhepDto>>> GetAllLeavesAsync(string? trangThai, string? maNV)
    {
        var query = _context.NghiPheps
            .AsNoTracking()
            .Include(n => n.NhanVien)
            .Include(n => n.NhanVienDuyet)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(n => n.TrangThai == trangThai.Trim());

        if (!string.IsNullOrWhiteSpace(maNV))
            query = query.Where(n => n.MaNV == maNV.Trim());

        var items = await query
            .OrderByDescending(n => n.TuNgay)
            .Select(n => MapToDto(n, n.NhanVien != null ? n.NhanVien.HoTen : n.MaNV, n.NhanVienDuyet != null ? n.NhanVienDuyet.HoTen : null))
            .ToListAsync();

        return ApiResponse<List<NghiPhepDto>>.Ok(items);
    }

    public async Task<ApiResponse<NghiPhepDto>> DuyetAsync(int id, DuyetNghiPhepDto dto, ClaimsPrincipal user)
    {
        var don = await _context.NghiPheps.FirstOrDefaultAsync(n => n.MaNP == id);
        if (don == null)
            return ApiResponse<NghiPhepDto>.Fail("Đơn nghỉ phép không tồn tại.", ErrorCode.NotFound);

        if (don.TrangThai != "Chờ duyệt")
            return ApiResponse<NghiPhepDto>.Fail("Chỉ có thể duyệt đơn nghỉ phép đang ở trạng thái Chờ duyệt.");

        var maNVHienTai = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNVHienTai))
        {
            return ApiResponse<NghiPhepDto>.Fail("Tài khoản chưa liên kết nhân viên, không thể duyệt đơn.");
        }
        maNVHienTai = maNVHienTai.Trim();

        // Quy tắc: Không được tự duyệt đơn của chính mình
        if (don.MaNV.Trim() == maNVHienTai)
        {
            return ApiResponse<NghiPhepDto>.Fail("Bạn không có quyền tự phê duyệt đơn nghỉ phép của chính mình.", ErrorCode.Forbidden);
        }

        don.TrangThai = dto.TrangThai; // "Đã duyệt" hoặc "Từ chối"
        don.MaNV_Duyet = maNVHienTai;
        don.NgayDuyet = DateTime.Now;

        // Lưu thay đổi -> Kích hoạt Trigger TR_NghiPhep_Update sinh bản ghi ChamCong nếu Đã duyệt
        await _context.SaveChangesAsync();

        _logger.LogInformation("NghiPhepDuyet: MaNP={MaNP}, Status={Status}, Approver={Approver}",
            id, dto.TrangThai, maNVHienTai);

        var nv = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == don.MaNV);
        var approver = await _context.NhanViens.AsNoTracking().FirstOrDefaultAsync(n => n.MaNV == maNVHienTai);

        return ApiResponse<NghiPhepDto>.Ok(MapToDto(don, nv?.HoTen, approver?.HoTen), $"Đã xử lý đơn: {dto.TrangThai}.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id, ClaimsPrincipal user)
    {
        var don = await _context.NghiPheps.FirstOrDefaultAsync(n => n.MaNP == id);
        if (don == null)
            return ApiResponse<bool>.Fail("Đơn nghỉ phép không tồn tại.", ErrorCode.NotFound);

        var maNV = user.FindFirstValue("MaNV");
        var role = user.FindFirstValue(ClaimTypes.Role);

        if (role == RoleConstants.NhanVien && don.MaNV.Trim() != maNV?.Trim())
        {
            return ApiResponse<bool>.Fail("Bạn không có quyền hủy đơn nghỉ phép của người khác.", ErrorCode.Forbidden);
        }

        if (don.TrangThai != "Chờ duyệt")
        {
            return ApiResponse<bool>.Fail("Không thể hủy đơn nghỉ phép đã được phê duyệt hoặc đã bị từ chối.");
        }

        _context.NghiPheps.Remove(don);
        await _context.SaveChangesAsync();

        _logger.LogInformation("NghiPhepCancelled: MaNP={MaNP}, Actor={Actor}", id, maNV);
        return ApiResponse<bool>.Ok(true, "Hủy đơn nghỉ phép thành công.");
    }

    private static NghiPhepDto MapToDto(NghiPhep n, string? hoTen, string? tenDuyet) => new()
    {
        MaNP = n.MaNP,
        MaNV = n.MaNV,
        HoTen = hoTen ?? n.MaNV,
        LoaiPhep = n.LoaiPhep,
        TuNgay = n.TuNgay,
        DenNgay = n.DenNgay,
        LyDo = n.LyDo,
        TrangThai = n.TrangThai,
        MaNV_Duyet = n.MaNV_Duyet,
        TenNV_Duyet = tenDuyet,
        NgayDuyet = n.NgayDuyet
    };
}
