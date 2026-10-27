using FluentValidation;
using HRM.Core.DTOs.BangLuong;

namespace HRM.Application.Validators;

public class CreateChiPhiPhatSinhValidator : AbstractValidator<CreateChiPhiPhatSinhDto>
{
    private static readonly string[] ValidLoai = { "Thưởng", "Phạt", "Ứng lương", "Công tác phí" };

    public CreateChiPhiPhatSinhValidator()
    {
        RuleFor(x => x.MaNV)
            .NotEmpty().WithMessage("Mã nhân viên không được để trống.")
            .Length(5).WithMessage("Mã nhân viên phải gồm 5 ký tự.");

        RuleFor(x => x.Loai)
            .NotEmpty().WithMessage("Loại phát sinh không được để trống.")
            .Must(l => ValidLoai.Contains(l)).WithMessage("Loại phát sinh không hợp lệ (Thưởng, Phạt, Ứng lương, Công tác phí).");

        RuleFor(x => x.SoTien)
            .GreaterThan(0).WithMessage("Số tiền phải lớn hơn 0.");

        RuleFor(x => x.Thang)
            .InclusiveBetween((byte)1, (byte)12).WithMessage("Tháng phải từ 1 đến 12.");

        RuleFor(x => x.Nam)
            .GreaterThanOrEqualTo((short)2000).WithMessage("Năm phải từ 2000 trở đi.");

        RuleFor(x => x.LyDo)
            .MaximumLength(255).WithMessage("Lý do không được vượt quá 255 ký tự.");
    }
}
