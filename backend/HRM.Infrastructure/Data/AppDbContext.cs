using HRM.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace HRM.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public virtual DbSet<PhongBan> PhongBans => Set<PhongBan>();
    public virtual DbSet<ChucVu> ChucVus => Set<ChucVu>();
    public virtual DbSet<NhanVien> NhanViens => Set<NhanVien>();
    public virtual DbSet<HopDong> HopDongs => Set<HopDong>();
    public virtual DbSet<ChamCong> ChamCongs => Set<ChamCong>();
    public virtual DbSet<NghiPhep> NghiPheps => Set<NghiPhep>();
    public virtual DbSet<BangLuong> BangLuongs => Set<BangLuong>();
    public virtual DbSet<ChiPhiPhatSinh> ChiPhiPhatSinhs => Set<ChiPhiPhatSinh>();
    public virtual DbSet<CongViec> CongViecs => Set<CongViec>();
    public virtual DbSet<TaiKhoan> TaiKhoans => Set<TaiKhoan>();
    public virtual DbSet<BinhLuan> BinhLuans => Set<BinhLuan>();
    public virtual DbSet<BoardKanbanItem> BoardKanbanItems => Set<BoardKanbanItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Tự động load tất cả IEntityTypeConfiguration trong assembly này
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
