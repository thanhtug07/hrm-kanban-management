using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class CongViecConfiguration : IEntityTypeConfiguration<CongViec>
{
    public void Configure(EntityTypeBuilder<CongViec> builder)
    {
        builder.ToTable("CongViec", tb =>
        {
            // Tránh lỗi OUTPUT INSERTED.* trên SQL Server khi bảng có Trigger
            tb.HasTrigger("TR_CongViec_Update");
        });

        // Global Query Filter: Tự động lọc ẩn các task đã xóa mềm
        builder.HasQueryFilter(e => !e.DaXoa);

        builder.HasKey(e => e.MaTask);

        builder.Property(e => e.TieuDe)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.MaNV_PhuTrach)
            .HasMaxLength(5)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(e => e.MaNV_Giao)
            .HasMaxLength(5)
            .IsUnicode(false)
            .IsRequired();

        builder.Property(e => e.TrangThai)
            .HasMaxLength(20)
            .HasDefaultValue("Todo");

        builder.Property(e => e.ViTri)
            .IsRequired(); // Gap 1000: 1000, 2000, 3000...

        builder.Property(e => e.DoUuTien)
            .HasMaxLength(20)
            .HasDefaultValue("Trung bình");

        builder.Property(e => e.NgayBatDau)
            .HasColumnType("date");

        builder.Property(e => e.Deadline)
            .HasColumnType("date");

        builder.Property(e => e.NgayHoanThanh)
            .HasColumnType("datetime");

        builder.Property(e => e.NgayTao)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.Property(e => e.NgayCapNhat)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.Property(e => e.DaXoa)
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(d => d.NhanVienPhuTrach)
            .WithMany(p => p.CongViecPhuTrachs)
            .HasForeignKey(d => d.MaNV_PhuTrach)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_CongViec_NhanVien_PhuTrach");

        builder.HasOne(d => d.NhanVienGiao)
            .WithMany(p => p.CongViecGiaos)
            .HasForeignKey(d => d.MaNV_Giao)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_CongViec_NhanVien_Giao");
    }
}
