using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class ChamCongConfiguration : IEntityTypeConfiguration<ChamCong>
{
    public void Configure(EntityTypeBuilder<ChamCong> builder)
    {
        builder.ToTable("ChamCong");

        builder.HasKey(e => e.MaCC);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.Ngay)
            .HasColumnType("date");

        builder.Property(e => e.GioVao)
            .HasColumnType("time");

        builder.Property(e => e.GioRa)
            .HasColumnType("time");

        builder.Property(e => e.TrangThai)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => new { e.MaNV, e.Ngay })
            .IsUnique();

        builder.HasOne(d => d.NhanVien)
            .WithMany(p => p.ChamCongs)
            .HasForeignKey(d => d.MaNV)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_ChamCong_NhanVien");
    }
}
