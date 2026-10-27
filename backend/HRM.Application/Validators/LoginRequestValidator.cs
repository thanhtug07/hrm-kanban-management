using FluentValidation;
using HRM.Core.DTOs.Auth;

namespace HRM.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.TenDangNhap)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
            .MaximumLength(50).WithMessage("Tên đăng nhập không được vượt quá 50 ký tự.");

        RuleFor(x => x.MatKhau)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.");
    }
}
