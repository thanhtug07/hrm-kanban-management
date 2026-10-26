using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRM.Core.Entities;

[Table("ChiPhiPhatSinh")]
public class ChiPhiPhatSinh
{
    [Key]
    public int MaPS { get; set; }

    [Required]
    [MaxLength(5)]
    public string MaNV { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Loai { get; set; } = string.Empty; // Thưởng, Phạt, Ứng lương, Công tác phí

    [Column(TypeName = "decimal(18,2)")]
    public decimal SoTien { get; set; }

    [MaxLength(255)]
    public string? LyDo { get; set; }

    public byte Thang { get; set; }
    public short Nam { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;

    // Navigation property
    [ForeignKey("MaNV")]
    public virtual NhanVien? NhanVien { get; set; }
}
