namespace HRM.Core.Common;

/// <summary>
/// Mã lỗi nghiệp vụ — dùng để Controller map sang HTTP status code
/// thay vì so khớp chuỗi Message (fragile).
/// </summary>
public enum ErrorCode
{
    None = 0,
    Validation,      // 400 - dữ liệu không hợp lệ
    Unauthorized,    // 401 - chưa xác thực
    Forbidden,       // 403 - không có quyền
    NotFound,        // 404 - không tìm thấy
    Conflict,        // 409 - xung đột (trùng dữ liệu)
    BusinessRule,    // 400 - vi phạm nghiệp vụ
    ServerError      // 500 - lỗi hệ thống
}
