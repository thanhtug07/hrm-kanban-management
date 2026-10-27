namespace HRM.Core.Constants;

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string HR = "HR";
    public const string TruongPhong = "TruongPhong";
    public const string NhanVien = "NhanVien";

    // Quản lý cấp công ty
    public const string AdminOrHR = Admin + "," + HR;
    // Quản lý (Admin, HR, Trưởng phòng) — có quyền quản lý nghiệp vụ
    public const string Managers = Admin + "," + HR + "," + TruongPhong;
    // Tất cả vai trò
    public const string All = Admin + "," + HR + "," + TruongPhong + "," + NhanVien;
}