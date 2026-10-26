using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class TaiKhoanConfiguration : IEntityTypeConfiguration<TaiKhoan>
{
    public void Configure(EntityTypeBuilder<TaiKhoan> builder)
    {
        builder.ToTable("TaiKhoan");

        builder.HasKey(e => e.MaTK);

        builder.Property(e => e.TenDangNhap)
            .HasMaxLength(50)
            .IsUnicode(false)
            .IsRequired();

        builder.HasIndex(e => e.TenDangNhap)
            .IsUnique();

        builder.Property(e => e.MatKhauHash)
            .HasMaxLength(255)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(e => e.VaiTro)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.TrangThai)
            .HasDefaultValue(true);

        builder.Property(e => e.NgayTao)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.HasOne(d => d.NhanVien)
            .WithOne(p => p.TaiKhoan)
            .HasForeignKey<TaiKhoan>(d => d.MaNV)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("FK_TaiKhoan_NhanVien");
    }
}
