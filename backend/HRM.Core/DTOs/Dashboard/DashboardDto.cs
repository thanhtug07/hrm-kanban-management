namespace HRM.Core.DTOs.Dashboard;

public class DashboardDto
{
    public int TongNhanVien { get; set; }
    public int NhanVienDangLam { get; set; }
    public int NhanVienNghiViec { get; set; }
    public int TaskQuaHan { get; set; }
    public int TaskHoanThanhThangNay { get; set; }
    public int DonNghiPhepChoDuyet { get; set; }
    public List<NhanSuTheoPhongBanItem> NhanSuTheoPhongBan { get; set; } = new();
    public List<TopNhanVienItem> TopNhanVienNhieuTask { get; set; } = new();
}

public class NhanSuTheoPhongBanItem
{
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public int SoLuong { get; set; }
}

public class TopNhanVienItem
{
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public int SoTask { get; set; }
}

public class DashboardCaNhanDto
{
    public TaskSummaryDto TaskCuaToi { get; set; } = new();
    public NghiPhepSummaryDto DonNghiPhepCuaToi { get; set; } = new();
    public ChamCongSummaryDto ChamCongThangNay { get; set; } = new();
    public LuongSummaryDto? LuongThangGanNhat { get; set; }
}

public class TaskSummaryDto
{
    public int Todo { get; set; }
    public int InProgress { get; set; }
    public int Done { get; set; }
    public int QuaHan { get; set; }
}

public class NghiPhepSummaryDto
{
    public int ChoDuyet { get; set; }
    public int DaDuyet { get; set; }
}

public class ChamCongSummaryDto
{
    public int SoNgayCong { get; set; }
    public int SoLanTre { get; set; }
}

public class LuongSummaryDto
{
    public byte Thang { get; set; }
    public short Nam { get; set; }
    public decimal ThucLinh { get; set; }
}
