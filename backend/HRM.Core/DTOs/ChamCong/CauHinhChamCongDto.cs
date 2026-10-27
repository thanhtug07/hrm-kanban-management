namespace HRM.Core.DTOs.ChamCong;

public class CauHinhChamCongDto
{
    public int MaCH { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public int PhutChoPhepSom { get; set; }
    public int PhutChoPhepTre { get; set; }
    public bool BatBuocCheckOutSauKetThuc { get; set; }
    public DateTime NgayCapNhat { get; set; }
}

public class UpdateCauHinhChamCongDto
{
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public int PhutChoPhepSom { get; set; } = 15;
    public int PhutChoPhepTre { get; set; } = 0;
    public bool BatBuocCheckOutSauKetThuc { get; set; } = true;
}