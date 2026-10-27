using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.DTOs.Dashboard;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<DashboardDto>> GetDashboardSummaryAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var now = DateTime.Now;

        var tongNhanVien = await _context.NhanViens.CountAsync();
        var nhanVienDangLam = await _context.NhanViens.CountAsync(n => n.TrangThai == "Đang làm");
        var nhanVienNghiViec = await _context.NhanViens.CountAsync(n => n.TrangThai == "Nghỉ việc");

        var taskQuaHan = await _context.CongViecs
            .CountAsync(c => !c.DaXoa && c.TrangThai != "Done" && c.Deadline < today);

        var taskHoanThanhThangNay = await _context.CongViecs
            .CountAsync(c => !c.DaXoa && c.TrangThai == "Done" 
                          && c.NgayHoanThanh.HasValue 
                          && c.NgayHoanThanh.Value.Month == now.Month 
                          && c.NgayHoanThanh.Value.Year == now.Year);

        var donNghiPhepChoDuyet = await _context.NghiPheps
            .CountAsync(n => n.TrangThai == "Chờ duyệt");

        var nhanSuTheoPB = await _context.NhanViens
            .AsNoTracking()
            .Where(n => n.TrangThai == "Đang làm")
            .GroupBy(n => new { n.MaPB, TenPB = n.PhongBan != null ? n.PhongBan.TenPB : n.MaPB })
            .Select(g => new NhanSuTheoPhongBanItem
            {
                MaPB = g.Key.MaPB,
                TenPB = g.Key.TenPB,
                SoLuong = g.Count()
            })
            .ToListAsync();

        var topNV = await _context.CongViecs
            .AsNoTracking()
            .Where(c => !c.DaXoa && !string.IsNullOrEmpty(c.MaNV_PhuTrach))
            .GroupBy(c => new { c.MaNV_PhuTrach, HoTen = c.NhanVienPhuTrach != null ? c.NhanVienPhuTrach.HoTen : c.MaNV_PhuTrach })
            .Select(g => new TopNhanVienItem
            {
                MaNV = g.Key.MaNV_PhuTrach,
                HoTen = g.Key.HoTen,
                SoTask = g.Count()
            })
            .OrderByDescending(x => x.SoTask)
            .Take(5)
            .ToListAsync();

        var dashboard = new DashboardDto
        {
            TongNhanVien = tongNhanVien,
            NhanVienDangLam = nhanVienDangLam,
            NhanVienNghiViec = nhanVienNghiViec,
            TaskQuaHan = taskQuaHan,
            TaskHoanThanhThangNay = taskHoanThanhThangNay,
            DonNghiPhepChoDuyet = donNghiPhepChoDuyet,
            NhanSuTheoPhongBan = nhanSuTheoPB,
            TopNhanVienNhieuTask = topNV
        };

        return ApiResponse<DashboardDto>.Ok(dashboard);
    }

    public async Task<ApiResponse<DashboardCaNhanDto>> GetMyDashboardAsync(ClaimsPrincipal user)
    {
        var maNV = user.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return ApiResponse<DashboardCaNhanDto>.Fail("Không xác định được mã nhân viên.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        var currentMonth = DateTime.Today.Month;
        var currentYear = DateTime.Today.Year;

        // Tasks của tôi
        var myTasks = await _context.CongViecs
            .AsNoTracking()
            .Where(c => c.MaNV_PhuTrach == maNV && !c.DaXoa)
            .ToListAsync();

        var taskSummary = new TaskSummaryDto
        {
            Todo = myTasks.Count(t => t.TrangThai == "Todo"),
            InProgress = myTasks.Count(t => t.TrangThai == "InProgress"),
            Done = myTasks.Count(t => t.TrangThai == "Done"),
            QuaHan = myTasks.Count(t => t.TrangThai != "Done" && t.Deadline < today)
        };

        // Đơn nghỉ phép của tôi
        var myLeaves = await _context.NghiPheps
            .AsNoTracking()
            .Where(n => n.MaNV == maNV)
            .ToListAsync();

        var leaveSummary = new NghiPhepSummaryDto
        {
            ChoDuyet = myLeaves.Count(l => l.TrangThai == "Chờ duyệt"),
            DaDuyet = myLeaves.Count(l => l.TrangThai == "Đã duyệt")
        };

        // Chấm công tháng này
        var attendances = await _context.ChamCongs
            .AsNoTracking()
            .Where(c => c.MaNV == maNV && c.Ngay.Month == currentMonth && c.Ngay.Year == currentYear)
            .ToListAsync();

        var attSummary = new ChamCongSummaryDto
        {
            SoNgayCong = attendances.Count(c => c.TrangThai == "Đủ công" || c.TrangThai == "Nghỉ phép"),
            SoLanTre = attendances.Count(c => c.TrangThai == "Trễ")
        };

        // Bảng lương tháng gần nhất
        var latestSalary = await _context.BangLuongs
            .AsNoTracking()
            .Where(b => b.MaNV == maNV)
            .OrderByDescending(b => b.Nam)
            .ThenByDescending(b => b.Thang)
            .FirstOrDefaultAsync();

        var luongSummary = latestSalary != null ? new LuongSummaryDto
        {
            Thang = latestSalary.Thang,
            Nam = latestSalary.Nam,
            ThucLinh = latestSalary.ThucLinh
        } : null;

        var myDashboard = new DashboardCaNhanDto
        {
            TaskCuaToi = taskSummary,
            DonNghiPhepCuaToi = leaveSummary,
            ChamCongThangNay = attSummary,
            LuongThangGanNhat = luongSummary
        };

        return ApiResponse<DashboardCaNhanDto>.Ok(myDashboard);
    }
}
