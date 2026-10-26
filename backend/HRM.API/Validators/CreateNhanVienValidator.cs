using FluentValidation;
using HRM.Core.DTOs.NhanVien;

namespace HRM.API.Validators;

public class CreateNhanVienValidator : AbstractValidator<CreateNhanVienDto>
{
    public CreateNhanVienValidator()
    {
        RuleFor(x => x.HoTen)
            .NotEmpty().WithMessage("Họ tên nhân viên không được để trống.")
            .MaximumLength(100).WithMessage("Họ tên không được vượt quá 100 ký tự.");

        RuleFor(x => x.GioiTinh)
            .NotEmpty().WithMessage("Giới tính không được để trống.")
            .Must(g => g == "Nam" || g == "Nữ")
            .WithMessage("Giới tính phải là 'Nam' hoặc 'Nữ'.");

        RuleFor(x => x.CCCD)
            .NotEmpty().WithMessage("Số CCCD không được để trống.")
            .Length(12).WithMessage("Số CCCD phải gồm đúng 12 chữ số.")
            .Matches(@"^[0-9]{12}$").WithMessage("Số CCCD chỉ được chứa các chữ số.");

        RuleFor(x => x.MaPB)
            .NotEmpty().WithMessage("Mã phòng ban không được để trống.");

        RuleFor(x => x.MaCV)
            .NotEmpty().WithMessage("Mã chức vụ không được để trống.");

        RuleFor(x => x.NgaySinh)
            .NotEmpty().WithMessage("Ngày sinh không được để trống.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Ngày sinh không được vượt quá ngày hiện tại.");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Định dạng email không hợp lệ.");

        RuleFor(x => x.SDT)
            .Matches(@"^[0-9]{10,11}$").When(x => !string.IsNullOrEmpty(x.SDT))
            .WithMessage("Số điện thoại phải từ 10 đến 11 chữ số.");
    }
}
