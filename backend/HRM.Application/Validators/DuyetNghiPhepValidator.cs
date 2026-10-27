using FluentValidation;
using HRM.Core.DTOs.NghiPhep;

namespace HRM.Application.Validators;

public class DuyetNghiPhepValidator : AbstractValidator<DuyetNghiPhepDto>
{
    public DuyetNghiPhepValidator()
    {
        RuleFor(x => x.TrangThai)
            .NotEmpty().WithMessage("Trạng thái duyệt không được để trống.")
            .Must(s => s == "Đã duyệt" || s == "Từ chối")
            .WithMessage("Trạng thái duyệt phải là 'Đã duyệt' hoặc 'Từ chối'.");
    }
}
