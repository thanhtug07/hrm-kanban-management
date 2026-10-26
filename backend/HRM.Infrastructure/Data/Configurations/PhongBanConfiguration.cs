using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class PhongBanConfiguration : IEntityTypeConfiguration<PhongBan>
{
    public void Configure(EntityTypeBuilder<PhongBan> builder)
    {
        builder.ToTable("PhongBan");

        builder.HasKey(e => e.MaPB);

        builder.Property(e => e.MaPB)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.TenPB)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(e => e.TenPB)
            .IsUnique();

        builder.Property(e => e.MoTa)
            .HasMaxLength(255);

        builder.Property(e => e.NgayThanhLap)
            .HasColumnType("date");

        builder.Property(e => e.MaNV_QL)
            .HasMaxLength(5)
            .IsUnicode(false);

        // Circular FK: PhongBan -> NhanVien (Trưởng phòng)
        builder.HasOne(d => d.TruongPhong)
            .WithMany()
            .HasForeignKey(d => d.MaNV_QL)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("FK_PhongBan_NhanVien_QL");
    }
}
