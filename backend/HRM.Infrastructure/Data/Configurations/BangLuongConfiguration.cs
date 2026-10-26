using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class BangLuongConfiguration : IEntityTypeConfiguration<BangLuong>
{
    public void Configure(EntityTypeBuilder<BangLuong> builder)
    {
        builder.ToTable("BangLuong");

        builder.HasKey(e => e.MaBL);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.Thang)
            .HasColumnType("tinyint");

        builder.Property(e => e.Nam)
            .HasColumnType("smallint");

        builder.Property(e => e.SoNgayCong)
            .HasDefaultValue(0);

        builder.Property(e => e.LuongCoBan)
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.PhuCap)
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0m);

        builder.Property(e => e.KhauTru)
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0m);

        builder.Property(e => e.ThucLinh)
            .HasColumnType("decimal(18,2)")
            .HasComputedColumnSql("(([LuongCoBan]+[PhuCap])-[KhauTru])", stored: true);

        builder.HasIndex(e => new { e.MaNV, e.Thang, e.Nam })
            .IsUnique();

        builder.HasOne(d => d.NhanVien)
            .WithMany(p => p.BangLuongs)
            .HasForeignKey(d => d.MaNV)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_BangLuong_NhanVien");
    }
}
