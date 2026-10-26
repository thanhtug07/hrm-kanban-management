namespace HRM.Core.Constants;

public static class RoleConstants
{
    public const string Admin = "Admin";
    public const string HR = "HR";
    public const string NhanVien = "NhanVien";

    public const string AdminOrHR = Admin + "," + HR;
    public const string All = Admin + "," + HR + "," + NhanVien;
}
