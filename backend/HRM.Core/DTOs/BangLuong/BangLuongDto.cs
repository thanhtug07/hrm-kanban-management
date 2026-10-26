namespace HRM.Core.DTOs.BangLuong;

public class BangLuongDto
{
    public int MaBL { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string TenCV { get; set; } = string.Empty;
    public byte Thang { get; set; }
    public short Nam { get; set; }
    public int SoNgayCong { get; set; }
    public decimal LuongCoBan { get; set; }
    public decimal PhuCap { get; set; }
    public decimal KhauTru { get; set; }
    public decimal ThucLinh { get; set; }
    public decimal ThuongPhatSinh { get; set; }
    public decimal PhatKhauTru { get; set; }
    public List<ChiPhiPhatSinhDto> ChiPhiPhatSinhs { get; set; } = new();
}

public class TinhLuongRequestDto
{
    public byte Thang { get; set; }
    public short Nam { get; set; }
}

public class TinhLuongResultDto
{
    public int SoNhanVienTinhLuong { get; set; }
    public byte Thang { get; set; }
    public short Nam { get; set; }
}
