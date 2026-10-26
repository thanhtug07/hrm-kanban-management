using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class NghiPhepConfiguration : IEntityTypeConfiguration<NghiPhep>
{
    public void Configure(EntityTypeBuilder<NghiPhep> builder)
    {
        builder.ToTable("NghiPhep", tb =>
        {
            tb.HasTrigger("TR_NghiPhep_Update");
        });

        builder.HasKey(e => e.MaNP);

        builder.Property(e => e.MaNV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.LoaiPhep)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.TuNgay)
            .HasColumnType("date");

        builder.Property(e => e.DenNgay)
            .HasColumnType("date");

        builder.Property(e => e.LyDo)
            .HasMaxLength(255);

        builder.Property(e => e.TrangThai)
            .HasMaxLength(20)
            .HasDefaultValue("Chờ duyệt");

        builder.Property(e => e.MaNV_Duyet)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.NgayDuyet)
            .HasColumnType("datetime");

        builder.HasOne(d => d.NhanVien)
            .WithMany(p => p.NghiPheps)
            .HasForeignKey(d => d.MaNV)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_NghiPhep_NhanVien");

        builder.HasOne(d => d.NhanVienDuyet)
            .WithMany(p => p.NghiPhepDuyets)
            .HasForeignKey(d => d.MaNV_Duyet)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_NghiPhep_NhanVien_Duyet");
    }
}
