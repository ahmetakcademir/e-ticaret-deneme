using DeniyorumButigi.Api.DTOs;
using FluentValidation;

namespace DeniyorumButigi.Api.Validators
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ürün adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Ürün adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Geçerli bir Kategori ID seçmelisiniz.");
                
            RuleFor(x => x.DiscountedPrice)
                .LessThan(x => x.Price).When(x => x.DiscountedPrice.HasValue).WithMessage("İndirimli fiyat, asıl fiyattan düşük olmalıdır.");
        }
    }
}
