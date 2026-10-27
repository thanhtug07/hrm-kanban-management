using System.Net;
using System.Text.Json;
using HRM.Core.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HRM.API.Middleware;

/// <summary>
/// Middleware bắt mọi exception chưa xử lý → trả về ApiResponse chuẩn hoá,
/// KHÔNG lộ stack trace / chi tiết nội bộ ra ngoài.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var traceId = context.TraceIdentifier;

        // Log chi tiết đầy đủ ở server (không trả ra ngoài)
        _logger.LogError(ex, "UnhandledException TraceId={TraceId} Path={Path}",
            traceId, context.Request.Path);

        var (statusCode, message) = MapException(ex);

        var response = ApiResponse<object>.Fail(
            message,
            statusCode == (int)HttpStatusCode.InternalServerError
                ? ErrorCode.ServerError
                : ErrorCode.BusinessRule);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var payload = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(payload);
    }

    private static (int StatusCode, string Message) MapException(Exception ex) => ex switch
    {
        // Lỗi khoá ngoại / trùng unique → 409
        DbUpdateException => ((int)HttpStatusCode.Conflict,
            "Dữ liệu xung đột (trùng khoá hoặc vi phạm ràng buộc). Vui lòng kiểm tra lại."),

        // Lỗi SQL Server trực tiếp
        SqlException => ((int)HttpStatusCode.BadRequest,
            "Thao tác cơ sở dữ liệu không hợp lệ. Vui lòng kiểm tra lại dữ liệu."),

        // Huỷ tác vụ
        OperationCanceledException => ((int)HttpStatusCode.RequestTimeout,
            "Yêu cầu bị huỷ hoặc quá thời gian xử lý."),

        ArgumentException or InvalidOperationException => ((int)HttpStatusCode.BadRequest,
            "Yêu cầu không hợp lệ."),

        UnauthorizedAccessException => ((int)HttpStatusCode.Forbidden,
            "Bạn không có quyền thực hiện thao tác này."),

        _ => ((int)HttpStatusCode.InternalServerError,
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên.")
    };
}

/// <summary>Extension để đăng ký middleware gọn trong Program.cs.</summary>
public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}
