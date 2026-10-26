using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class ChucVuConfiguration : IEntityTypeConfiguration<ChucVu>
{
    public void Configure(EntityTypeBuilder<ChucVu> builder)
    {
        builder.ToTable("ChucVu");

        builder.HasKey(e => e.MaCV);

        builder.Property(e => e.MaCV)
            .HasMaxLength(5)
            .IsUnicode(false);

        builder.Property(e => e.TenCV)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(e => e.TenCV)
            .IsUnique();

        builder.Property(e => e.LuongCoBan)
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.MoTa)
            .HasMaxLength(255);
    }
}
