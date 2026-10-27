namespace HRM.Core.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Mã lỗi nghiệp vụ — Controller dùng để map HTTP status (không so khớp chuỗi Message nữa).
    /// </summary>
    public ErrorCode ErrorCode { get; set; } = ErrorCode.None;

    public static ApiResponse<T> Ok(T data, string message = "Thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            ErrorCode = ErrorCode.None
        };
    }

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors,
            ErrorCode = ErrorCode.BusinessRule
        };
    }

    /// <summary>
    /// Fail với mã lỗi cụ thể (dùng cho phân quyền / not found / conflict).
    /// </summary>
    public static ApiResponse<T> Fail(string message, ErrorCode errorCode, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors,
            ErrorCode = errorCode
        };
    }
}
