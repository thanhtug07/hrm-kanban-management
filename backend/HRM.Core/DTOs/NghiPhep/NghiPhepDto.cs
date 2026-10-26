namespace HRM.Core.DTOs.NghiPhep;

public class NghiPhepDto
{
    public int MaNP { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string LoaiPhep { get; set; } = "Phép năm";
    public DateOnly TuNgay { get; set; }
    public DateOnly DenNgay { get; set; }
    public string? LyDo { get; set; }
    public string TrangThai { get; set; } = "Chờ duyệt";
    public string? MaNV_Duyet { get; set; }
    public string? TenNV_Duyet { get; set; }
    public DateTime? NgayDuyet { get; set; }
}

public class CreateNghiPhepDto
{
    public string LoaiPhep { get; set; } = "Phép năm";
    public DateOnly TuNgay { get; set; }
    public DateOnly DenNgay { get; set; }
    public string? LyDo { get; set; }
}

public class DuyetNghiPhepDto
{
    public string TrangThai { get; set; } = "Đã duyệt"; // Đã duyệt | Từ chối
    public string? LyDoTuChoi { get; set; }
}
