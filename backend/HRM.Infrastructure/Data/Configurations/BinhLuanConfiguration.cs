using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class BinhLuanConfiguration : IEntityTypeConfiguration<BinhLuan>
{
    public void Configure(EntityTypeBuilder<BinhLuan> builder)
    {
        builder.ToTable("BinhLuan");

        builder.HasKey(e => e.MaBL);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(e => e.NoiDung)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.ThoiGian)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.HasOne(d => d.CongViec)
            .WithMany(p => p.BinhLuans)
            .HasForeignKey(d => d.MaTask)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_BinhLuan_CongViec");

        builder.HasOne(d => d.NhanVien)
            .WithMany(p => p.BinhLuans)
            .HasForeignKey(d => d.MaNV)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_BinhLuan_NhanVien");
    }
}
