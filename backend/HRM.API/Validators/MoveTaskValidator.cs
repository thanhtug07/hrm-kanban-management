using FluentValidation;
using HRM.Core.DTOs.Kanban;

namespace HRM.API.Validators;

public class MoveTaskValidator : AbstractValidator<MoveTaskDto>
{
    private static readonly string[] ValidStatuses = { "Todo", "InProgress", "Review", "Done" };

    public MoveTaskValidator()
    {
        RuleFor(x => x.TrangThaiMoi)
            .NotEmpty().WithMessage("Trạng thái mới không được để trống.")
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Trạng thái mới không hợp lệ (Todo, InProgress, Review, Done).");
    }
}
