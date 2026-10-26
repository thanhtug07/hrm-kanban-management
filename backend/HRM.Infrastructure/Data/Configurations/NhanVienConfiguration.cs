using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class NhanVienConfiguration : IEntityTypeConfiguration<NhanVien>
{
    public void Configure(EntityTypeBuilder<NhanVien> builder)
    {
        builder.ToTable("NhanVien");

        builder.HasKey(e => e.MaNV);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.HoTen)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.GioiTinh)
            .HasMaxLength(5)
            .IsRequired();

        builder.Property(e => e.NgaySinh)
            .HasColumnType("date");

        builder.Property(e => e.CCCD)
            .HasMaxLength(12)
            .IsUnicode(false)
            .IsRequired();

        builder.HasIndex(e => e.CCCD)
            .IsUnique();

        builder.Property(e => e.SDT)
            .HasMaxLength(15)
            .IsUnicode(false);

        builder.Property(e => e.Email)
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(e => e.DiaChi)
            .HasMaxLength(255);

        builder.Property(e => e.MaPB)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.MaCV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.NgayVaoLam)
            .HasColumnType("date");

        builder.Property(e => e.TrangThai)
            .HasMaxLength(20)
            .HasDefaultValue("Đang làm");

        // Relationships
        builder.HasOne(d => d.PhongBan)
            .WithMany(p => p.NhanViens)
            .HasForeignKey(d => d.MaPB)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_NhanVien_PhongBan");

        builder.HasOne(d => d.ChucVu)
            .WithMany(p => p.NhanViens)
            .HasForeignKey(d => d.MaCV)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_NhanVien_ChucVu");
    }
}
