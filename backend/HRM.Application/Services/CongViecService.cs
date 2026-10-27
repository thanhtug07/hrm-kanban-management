using System.Security.Claims;
using HRM.Core.Common;
using HRM.Core.Constants;
using HRM.Core.DTOs.Kanban;
using HRM.Core.Entities;
using HRM.Core.Interfaces;
using HRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRM.Application.Services;

public class CongViecService : ICongViecService
{
    private readonly AppDbContext _context;
    private readonly ILogger<CongViecService> _logger;

    private const int GAP = 1000;
    private const int MIN_GAP = 2;

    public CongViecService(AppDbContext context, ILogger<CongViecService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<KanbanBoardDto>> GetBoardAsync(string? maNV, string? doUuTien, string? search, ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        var query = _context.BoardKanbanItems.AsNoTracking();

        // Phân quyền: Nhân viên chỉ xem task mình phụ trách
        if (role == RoleConstants.NhanVien)
        {
            query = query.Where(x => x.MaNV_PhuTrach == userMaNV);
        }
        else if (!string.IsNullOrWhiteSpace(maNV))
        {
            query = query.Where(x => x.MaNV_PhuTrach == maNV.Trim());
        }

        if (!string.IsNullOrWhiteSpace(doUuTien))
        {
            var uuTien = doUuTien.Trim();
            query = query.Where(x => x.DoUuTien == uuTien);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var kw = search.Trim().ToLower();
            query = query.Where(x => x.TieuDe.ToLower().Contains(kw) || (x.MoTa != null && x.MoTa.ToLower().Contains(kw)));
        }

        var items = await query.OrderBy(x => x.ViTri).ToListAsync();

        var board = new KanbanBoardDto
        {
            Todo = items.Where(x => x.TrangThai == "Todo").Select(MapToDto).ToList(),
            InProgress = items.Where(x => x.TrangThai == "InProgress").Select(MapToDto).ToList(),
            Review = items.Where(x => x.TrangThai == "Review").Select(MapToDto).ToList(),
            Done = items.Where(x => x.TrangThai == "Done").Select(MapToDto).ToList(),
            TotalTasks = items.Count,
            OverdueTasks = items.Count(x => x.LaQuaHan)
        };

        return ApiResponse<KanbanBoardDto>.Ok(board);
    }

    public async Task<ApiResponse<TaskItemDto>> GetByIdAsync(int id, ClaimsPrincipal user)
    {
        var item = await _context.BoardKanbanItems.AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaTask == id);

        if (item == null)
        {
            return ApiResponse<TaskItemDto>.Fail("Công việc không tồn tại hoặc đã bị xóa.");
        }

        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        if (role == RoleConstants.NhanVien && item.MaNV_PhuTrach.Trim() != userMaNV?.Trim())
        {
            return ApiResponse<TaskItemDto>.Fail("Bạn không có quyền xem chi tiết công việc này.", ErrorCode.Forbidden);
        }

        return ApiResponse<TaskItemDto>.Ok(MapToDto(item));
    }

    public async Task<ApiResponse<TaskItemDto>> CreateTaskAsync(CreateTaskDto dto, ClaimsPrincipal user)
    {
        var assigneeExists = await _context.NhanViens.AnyAsync(nv => nv.MaNV == dto.MaNV_PhuTrach);
        if (!assigneeExists)
        {
            return ApiResponse<TaskItemDto>.Fail($"Nhân viên phụ trách '{dto.MaNV_PhuTrach}' không tồn tại trên hệ thống.");
        }

        var maNVGiao = user.FindFirstValue("MaNV") ?? "NV000";

        var maxViTri = await _context.CongViecs
            .Where(t => t.TrangThai == "Todo" && !t.DaXoa)
            .MaxAsync(t => (int?)t.ViTri) ?? 0;

        var task = new CongViec
        {
            TieuDe = dto.TieuDe.Trim(),
            MoTa = dto.MoTa?.Trim(),
            MaNV_PhuTrach = dto.MaNV_PhuTrach,
            MaNV_Giao = maNVGiao,
            TrangThai = "Todo",
            ViTri = maxViTri + GAP,
            DoUuTien = dto.DoUuTien,
            NgayBatDau = dto.NgayBatDau,
            Deadline = dto.Deadline,
            NgayTao = DateTime.Now,
            DaXoa = false
        };

        _context.CongViecs.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("TaskCreated: ActorMaNV={ActorMaNV}, TaskId={TaskId}, Assignee={Assignee}",
            maNVGiao, task.MaTask, task.MaNV_PhuTrach);

        var createdItem = await _context.BoardKanbanItems.AsNoTracking()
            .FirstAsync(x => x.MaTask == task.MaTask);

        return ApiResponse<TaskItemDto>.Ok(MapToDto(createdItem), "Tạo công việc mới thành công.");
    }

    public async Task<ApiResponse<TaskItemDto>> UpdateTaskAsync(int id, UpdateTaskDto dto, ClaimsPrincipal user)
    {
        var task = await _context.CongViecs.FirstOrDefaultAsync(t => t.MaTask == id);
        if (task == null)
        {
            return ApiResponse<TaskItemDto>.Fail("Công việc không tồn tại hoặc đã bị xóa.");
        }

        var assigneeExists = await _context.NhanViens.AnyAsync(nv => nv.MaNV == dto.MaNV_PhuTrach);
        if (!assigneeExists)
        {
            return ApiResponse<TaskItemDto>.Fail($"Nhân viên phụ trách '{dto.MaNV_PhuTrach}' không tồn tại.");
        }

        task.TieuDe = dto.TieuDe.Trim();
        task.MoTa = dto.MoTa?.Trim();
        task.MaNV_PhuTrach = dto.MaNV_PhuTrach;
        task.DoUuTien = dto.DoUuTien;
        task.NgayBatDau = dto.NgayBatDau;
        task.Deadline = dto.Deadline;
        task.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();

        var updatedItem = await _context.BoardKanbanItems.AsNoTracking()
            .FirstAsync(x => x.MaTask == id);

        return ApiResponse<TaskItemDto>.Ok(MapToDto(updatedItem), "Cập nhật công việc thành công.");
    }

    public async Task<ApiResponse<TaskItemDto>> MoveTaskAsync(int id, MoveTaskDto dto, ClaimsPrincipal user)
    {
        // LỚP BẢO VỆ 1: Kiểm tra thực thể qua EF Core (Global Query Filter đã chặn DaXoa = true)
        var task = await _context.CongViecs.FirstOrDefaultAsync(t => t.MaTask == id);
        if (task == null)
        {
            return ApiResponse<TaskItemDto>.Fail("Công việc không tồn tại hoặc đã bị xóa.");
        }

        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        // Phân quyền di chuyển task
        if (role == RoleConstants.NhanVien && task.MaNV_PhuTrach.Trim() != userMaNV?.Trim())
        {
            return ApiResponse<TaskItemDto>.Fail("Bạn không có quyền di chuyển công việc này (chỉ được di chuyển công việc của mình).", ErrorCode.Forbidden);
        }

        var fromStatus = task.TrangThai;

        // Bọc transaction: rebalance (nhiều lệnh ghi) + SP di chuyển phải NGUYÊN TỬ
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Tính toán vị trí theo thuật toán Gap-based 1000 + Rebalance
            int viTriMoi = await TinhViTriMoiAsync(dto.TrangThaiMoi, dto.MaTaskTruoc, dto.MaTaskSau, id);

            // LỚP BẢO VỆ 2: Gọi Stored Procedure SP_DiChuyenTask
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC dbo.SP_DiChuyenTask @MaTask = {0}, @TrangThaiMoi = {1}, @ViTriMoi = {2}",
                id, dto.TrangThaiMoi, viTriMoi);

            await transaction.CommitAsync();

            _logger.LogInformation("TaskMoved: ActorMaNV={ActorMaNV}, TaskId={TaskId}, FromStatus={FromStatus}, ToStatus={ToStatus}, ViTriMoi={ViTriMoi}",
                userMaNV, id, fromStatus, dto.TrangThaiMoi, viTriMoi);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "MoveTaskFailed: TaskId={TaskId}, ToStatus={ToStatus}", id, dto.TrangThaiMoi);
            return ApiResponse<TaskItemDto>.Fail("Di chuyển công việc thất bại, đã hoàn tác thay đổi.");
        }


        // Query lại View để lấy thông tin đầy đủ nhất (kèm cờ quá hạn & ngày hoàn thành do trigger tính)
        var movedItem = await _context.BoardKanbanItems.AsNoTracking()
            .FirstAsync(x => x.MaTask == id);

        return ApiResponse<TaskItemDto>.Ok(MapToDto(movedItem), "Di chuyển công việc thành công.");
    }

    public async Task<ApiResponse<bool>> DeleteTaskAsync(int id, ClaimsPrincipal user)
    {
        var task = await _context.CongViecs.FirstOrDefaultAsync(t => t.MaTask == id);
        if (task == null)
        {
            return ApiResponse<bool>.Fail("Công việc không tồn tại hoặc đã bị xóa.");
        }

        task.DaXoa = true;
        task.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        var userMaNV = user.FindFirstValue("MaNV");
        _logger.LogInformation("TaskDeleted: ActorMaNV={ActorMaNV}, TaskId={TaskId}", userMaNV, id);

        return ApiResponse<bool>.Ok(true, "Xóa công việc thành công (đã chuyển vào thùng rác).");
    }

    public async Task<ApiResponse<List<BinhLuanDto>>> GetCommentsAsync(int taskId, ClaimsPrincipal user)
    {
        var task = await _context.CongViecs.FirstOrDefaultAsync(t => t.MaTask == taskId);
        if (task == null)
        {
            return ApiResponse<List<BinhLuanDto>>.Fail("Công việc không tồn tại.");
        }

        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV");

        bool canView = role == RoleConstants.Admin || role == RoleConstants.HR
            || task.MaNV_PhuTrach.Trim() == userMaNV?.Trim() || task.MaNV_Giao.Trim() == userMaNV?.Trim();

        if (!canView)
        {
            return ApiResponse<List<BinhLuanDto>>.Fail("Bạn không có quyền xem bình luận của công việc này.", ErrorCode.Forbidden);
        }

        var comments = await _context.BinhLuans.AsNoTracking()
            .Include(b => b.NhanVien)
            .Where(b => b.MaTask == taskId)
            .OrderBy(b => b.ThoiGian)
            .Select(b => new BinhLuanDto
            {
                MaBL = b.MaBL,
                MaTask = b.MaTask,
                MaNV = b.MaNV,
                HoTen = b.NhanVien != null ? b.NhanVien.HoTen : b.MaNV,
                NoiDung = b.NoiDung,
                ThoiGian = b.ThoiGian
            })
            .ToListAsync();

        return ApiResponse<List<BinhLuanDto>>.Ok(comments);
    }

    public async Task<ApiResponse<BinhLuanDto>> AddCommentAsync(int taskId, CreateBinhLuanDto dto, ClaimsPrincipal user)
    {
        var task = await _context.CongViecs.FirstOrDefaultAsync(t => t.MaTask == taskId);
        if (task == null)
        {
            return ApiResponse<BinhLuanDto>.Fail("Công việc không tồn tại.");
        }

        var role = user.FindFirstValue(ClaimTypes.Role);
        var userMaNV = user.FindFirstValue("MaNV") ?? "NV000";

        bool canComment = role == RoleConstants.Admin || role == RoleConstants.HR
            || task.MaNV_PhuTrach.Trim() == userMaNV.Trim() || task.MaNV_Giao.Trim() == userMaNV.Trim();

        if (!canComment)
        {
            return ApiResponse<BinhLuanDto>.Fail("Bạn không có quyền bình luận trên công việc này.", ErrorCode.Forbidden);
        }

        var comment = new BinhLuan
        {
            MaTask = taskId,
            MaNV = userMaNV,
            NoiDung = dto.NoiDung.Trim(),
            ThoiGian = DateTime.Now
        };

        _context.BinhLuans.Add(comment);
        await _context.SaveChangesAsync();

        var nv = await _context.NhanViens.AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaNV == userMaNV);

        _logger.LogInformation("CommentAdded: ActorMaNV={ActorMaNV}, TaskId={TaskId}, CommentId={CommentId}",
            userMaNV, taskId, comment.MaBL);

        var result = new BinhLuanDto
        {
            MaBL = comment.MaBL,
            MaTask = comment.MaTask,
            MaNV = comment.MaNV ?? userMaNV,
            HoTen = nv?.HoTen ?? userMaNV,
            NoiDung = comment.NoiDung,
            ThoiGian = comment.ThoiGian
        };

        return ApiResponse<BinhLuanDto>.Ok(result, "Đã thêm bình luận mới.");
    }

    #region Thuật toán Gap-based & Rebalance

    private async Task<int> TinhViTriMoiAsync(string trangThai, int? maTruoc, int? maSau, int currentTaskId)
    {
        int? viTriTruoc = null;
        if (maTruoc.HasValue && maTruoc.Value != currentTaskId)
        {
            viTriTruoc = await _context.CongViecs
                .Where(t => t.MaTask == maTruoc.Value && t.TrangThai == trangThai && !t.DaXoa)
                .Select(t => (int?)t.ViTri)
                .FirstOrDefaultAsync();
        }

        int? viTriSau = null;
        if (maSau.HasValue && maSau.Value != currentTaskId)
        {
            viTriSau = await _context.CongViecs
                .Where(t => t.MaTask == maSau.Value && t.TrangThai == trangThai && !t.DaXoa)
                .Select(t => (int?)t.ViTri)
                .FirstOrDefaultAsync();
        }

        // Case 1: Cột đích rỗng
        if (viTriTruoc == null && viTriSau == null)
        {
            var maxPos = await _context.CongViecs
                .Where(t => t.TrangThai == trangThai && !t.DaXoa && t.MaTask != currentTaskId)
                .MaxAsync(t => (int?)t.ViTri) ?? 0;
            return maxPos + GAP;
        }

        // Case 2: Chèn lên đầu cột (không có task trước)
        if (viTriTruoc == null && viTriSau.HasValue)
        {
            if (viTriSau.Value / 2 > 0)
                return viTriSau.Value / 2;

            // Gap đã cạn ở đầu cột -> Rebalance toàn bộ cột
            return await RebalanceAsync(trangThai, currentTaskId);
        }

        // Case 3: Chèn xuống cuối cột (không có task sau)
        if (viTriTruoc.HasValue && viTriSau == null)
        {
            return viTriTruoc.Value + GAP;
        }

        // Case 4: Chèn vào giữa hai task
        int gap = viTriSau!.Value - viTriTruoc!.Value;
        if (gap < MIN_GAP)
        {
            // Gap cạn giữa hai task -> Kích hoạt Rebalance
            return await RebalanceAsync(trangThai, currentTaskId);
        }

        return (viTriTruoc.Value + viTriSau.Value) / 2;
    }

    private async Task<int> RebalanceAsync(string trangThai, int currentTaskId)
    {
        _logger.LogWarning("RebalanceTriggered: Status={Status}", trangThai);

        var tasks = await _context.CongViecs
            .Where(t => t.TrangThai == trangThai && !t.DaXoa && t.MaTask != currentTaskId)
            .OrderBy(t => t.ViTri)
            .ToListAsync();

        int pos = GAP;
        foreach (var t in tasks)
        {
            t.ViTri = pos;
            pos += GAP;
        }

        await _context.SaveChangesAsync();
        return pos;
    }

    private static TaskItemDto MapToDto(BoardKanbanItem item) => new()
    {
        MaTask = item.MaTask,
        TieuDe = item.TieuDe,
        MoTa = item.MoTa,
        TrangThai = item.TrangThai,
        ViTri = item.ViTri,
        DoUuTien = item.DoUuTien,
        NgayBatDau = item.NgayBatDau,
        Deadline = item.Deadline,
        NgayHoanThanh = item.NgayHoanThanh,
        MaNV_PhuTrach = item.MaNV_PhuTrach,
        TenNV_PhuTrach = item.TenNV_PhuTrach,
        MaNV_Giao = item.MaNV_Giao,
        TenNV_Giao = item.TenNV_Giao,
        NgayTao = item.NgayTao,
        NgayCapNhat = item.NgayCapNhat,
        LaQuaHan = item.LaQuaHan,
        SoBinhLuan = item.SoBinhLuan
    };

    #endregion
}