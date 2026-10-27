using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM.Core.Entities;

[Table("CauHinhChamCong")]
public class CauHinhChamCong
{
    [Key]
    public int MaCH { get; set; }

    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public int PhutChoPhepSom { get; set; } = 15;
    public int PhutChoPhepTre { get; set; } = 0;
    public bool BatBuocCheckOutSauKetThuc { get; set; } = true;
    public DateTime NgayCapNhat { get; set; } = DateTime.Now;
}