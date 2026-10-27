using FluentValidation;
using HRM.Core.DTOs.Kanban;

namespace HRM.Application.Validators;

public class CreateTaskValidator : AbstractValidator<CreateTaskDto>
{
    private static readonly string[] ValidPriorities = { "Thấp", "Trung bình", "Cao", "Khẩn cấp" };

    public CreateTaskValidator()
    {
        RuleFor(x => x.TieuDe)
            .NotEmpty().WithMessage("Tiêu đề công việc không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề không được vượt quá 200 ký tự.");

        RuleFor(x => x.MoTa)
            .MaximumLength(2000).WithMessage("Mô tả không được vượt quá 2000 ký tự.");

        RuleFor(x => x.MaNV_PhuTrach)
            .NotEmpty().WithMessage("Mã nhân viên phụ trách không được để trống.")
            .Length(5).WithMessage("Mã nhân viên phải gồm 5 ký tự.");

        RuleFor(x => x.DoUuTien)
            .Must(p => ValidPriorities.Contains(p))
            .WithMessage("Độ ưu tiên không hợp lệ (Thấp, Trung bình, Cao, Khẩn cấp).");

        RuleFor(x => x.Deadline)
            .GreaterThanOrEqualTo(x => x.NgayBatDau)
            .When(x => x.Deadline.HasValue && x.NgayBatDau.HasValue)
            .WithMessage("Hạn chót (Deadline) phải lớn hơn hoặc bằng ngày bắt đầu.");
    }
}
