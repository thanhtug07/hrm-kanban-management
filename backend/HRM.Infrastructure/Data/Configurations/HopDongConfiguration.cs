using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class HopDongConfiguration : IEntityTypeConfiguration<HopDong>
{
    public void Configure(EntityTypeBuilder<HopDong> builder)
    {
        builder.ToTable("HopDong", tb =>
        {
            tb.HasTrigger("TR_HopDong_Update");
        });

        builder.HasKey(e => e.MaHD);

        builder.Property(e => e.MaHD)
            .HasMaxLength(6)
            .IsUnicode(false);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.LoaiHD)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.NgayBatDau)
            .HasColumnType("date");

        builder.Property(e => e.NgayKetThuc)
            .HasColumnType("date");

        builder.Property(e => e.LuongThoaThuan)
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.TrangThai)
            .HasMaxLength(20)
            .HasDefaultValue("Hiệu lực");

        builder.HasOne(d => d.NhanVien)
            .WithMany(p => p.HopDongs)
            .HasForeignKey(d => d.MaNV)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_HopDong_NhanVien");
    }
}
