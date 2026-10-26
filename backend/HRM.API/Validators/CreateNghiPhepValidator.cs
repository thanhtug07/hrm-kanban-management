using FluentValidation;
using HRM.Core.DTOs.NghiPhep;

namespace HRM.API.Validators;

public class CreateNghiPhepValidator : AbstractValidator<CreateNghiPhepDto>
{
    private static readonly string[] ValidLoaiPhep = { "Phép năm", "Bệnh", "Thai sản", "Không lương" };

    public CreateNghiPhepValidator()
    {
        RuleFor(x => x.LoaiPhep)
            .NotEmpty().WithMessage("Loại phép không được để trống.")
            .Must(lp => ValidLoaiPhep.Contains(lp))
            .WithMessage("Loại phép không hợp lệ (Phép năm, Bệnh, Thai sản, Không lương).");

        RuleFor(x => x.TuNgay)
            .NotEmpty().WithMessage("Từ ngày không được để trống.");

        RuleFor(x => x.DenNgay)
            .NotEmpty().WithMessage("Đến ngày không được để trống.")
            .GreaterThanOrEqualTo(x => x.TuNgay)
            .WithMessage("Đến ngày phải lớn hơn hoặc bằng từ ngày.");
    }
}
