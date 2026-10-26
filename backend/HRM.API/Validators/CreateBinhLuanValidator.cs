using FluentValidation;
using HRM.Core.DTOs.Kanban;

namespace HRM.API.Validators;

public class CreateBinhLuanValidator : AbstractValidator<CreateBinhLuanDto>
{
    public CreateBinhLuanValidator()
    {
        RuleFor(x => x.NoiDung)
            .NotEmpty().WithMessage("Nội dung bình luận không được để trống.")
            .MaximumLength(1000).WithMessage("Nội dung bình luận không được vượt quá 1000 ký tự.");
    }
}
