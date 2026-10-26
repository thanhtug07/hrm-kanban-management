using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class BoardKanbanItemConfiguration : IEntityTypeConfiguration<BoardKanbanItem>
{
    public void Configure(EntityTypeBuilder<BoardKanbanItem> builder)
    {
        builder.ToView("VW_BoardKanban");
        builder.HasKey(e => e.MaTask);

        builder.Property(e => e.MaTask).HasColumnName("MaTask");
        builder.Property(e => e.TieuDe).HasColumnName("TieuDe");
        builder.Property(e => e.MoTa).HasColumnName("MoTa");
        builder.Property(e => e.TrangThai).HasColumnName("TrangThai");
        builder.Property(e => e.ViTri).HasColumnName("ViTri");
        builder.Property(e => e.DoUuTien).HasColumnName("DoUuTien");
        builder.Property(e => e.NgayBatDau).HasColumnName("NgayBatDau");
        builder.Property(e => e.Deadline).HasColumnName("Deadline");
        builder.Property(e => e.NgayHoanThanh).HasColumnName("NgayHoanThanh");
        builder.Property(e => e.MaNV_PhuTrach).HasColumnName("MaNV_PhuTrach");
        builder.Property(e => e.TenNV_PhuTrach).HasColumnName("TenNV_PhuTrach");
        builder.Property(e => e.MaNV_Giao).HasColumnName("MaNV_Giao");
        builder.Property(e => e.TenNV_Giao).HasColumnName("TenNV_Giao");
        builder.Property(e => e.NgayTao).HasColumnName("NgayTao");
        builder.Property(e => e.NgayCapNhat).HasColumnName("NgayCapNhat");
        builder.Property(e => e.LaQuaHan).HasColumnName("LaQuaHan");
        builder.Property(e => e.SoBinhLuan).HasColumnName("SoBinhLuan");
    }
}
