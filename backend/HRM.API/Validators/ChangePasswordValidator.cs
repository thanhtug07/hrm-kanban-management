using FluentValidation;
using HRM.Core.DTOs.Auth;

namespace HRM.API.Validators;

public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.MatKhauCu)
            .NotEmpty().WithMessage("Mật khẩu hiện tại không được để trống.");

        RuleFor(x => x.MatKhauMoi)
            .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
            .MinimumLength(8).WithMessage("Mật khẩu mới phải có ít nhất 8 ký tự.")
            .NotEqual(x => x.MatKhauCu).WithMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }
}
