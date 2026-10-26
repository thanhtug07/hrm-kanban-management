using FluentValidation;
using HRM.Core.DTOs.BangLuong;

namespace HRM.API.Validators;

public class TinhLuongValidator : AbstractValidator<TinhLuongRequestDto>
{
    public TinhLuongValidator()
    {
        RuleFor(x => x.Thang)
            .InclusiveBetween((byte)1, (byte)12).WithMessage("Tháng tính lương phải từ 1 đến 12.");

        RuleFor(x => x.Nam)
            .GreaterThanOrEqualTo((short)2000).WithMessage("Năm tính lương phải từ năm 2000 trở đi.");
    }
}
