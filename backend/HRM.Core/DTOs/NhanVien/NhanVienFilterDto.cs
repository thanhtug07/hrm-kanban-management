namespace HRM.Core.DTOs.NhanVien;

public class NhanVienFilterDto
{
    public string? MaPB { get; set; }
    public string? MaCV { get; set; }
    public string? TrangThai { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "HoTen";
    public string? SortDir { get; set; } = "asc";
}
