using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRM.Infrastructure.Data.Configurations;

public class CauHinhChamCongConfiguration : IEntityTypeConfiguration<CauHinhChamCong>
{
    public void Configure(EntityTypeBuilder<CauHinhChamCong> builder)
    {
        builder.ToTable("CauHinhChamCong");
        builder.HasKey(e => e.MaCH);
        builder.Property(e => e.GioBatDau).HasColumnType("time");
        builder.Property(e => e.GioKetThuc).HasColumnType("time");
        builder.Property(e => e.PhutChoPhepSom).HasDefaultValue(15);
        builder.Property(e => e.PhutChoPhepTre).HasDefaultValue(0);
        builder.Property(e => e.BatBuocCheckOutSauKetThuc).HasDefaultValue(true);
        builder.Property(e => e.NgayCapNhat).HasDefaultValueSql("GETDATE()");
    }
}