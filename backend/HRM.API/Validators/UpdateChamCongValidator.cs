using FluentValidation;
using HRM.Core.DTOs.ChamCong;

namespace HRM.API.Validators;

public class UpdateChamCongValidator : AbstractValidator<UpdateChamCongDto>
{
    private static readonly string[] ValidTrangThai = { "Đủ công", "Trễ", "Vắng", "Nghỉ phép" };

    public UpdateChamCongValidator()
    {
        RuleFor(x => x.TrangThai)
            .NotEmpty().WithMessage("Trạng thái chấm công không được để trống.")
            .Must(t => ValidTrangThai.Contains(t)).WithMessage("Trạng thái không hợp lệ (Đủ công, Trễ, Vắng, Nghỉ phép).");

        RuleFor(x => x)
            .Must(x => !x.GioVao.HasValue || !x.GioRa.HasValue || x.GioRa.Value >= x.GioVao.Value)
            .WithMessage("Giờ ra phải lớn hơn hoặc bằng giờ vào.");
    }
}
