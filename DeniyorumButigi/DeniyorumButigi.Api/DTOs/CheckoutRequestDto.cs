using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public class CheckoutRequestDto
    {
        [Required(ErrorMessage = "Müşteri adı zorunludur.")]
        public string CustomerFirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Müşteri soyadı zorunludur.")]
        public string CustomerLastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta adresi zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Telefon numarası zorunludur.")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Teslimat adresi zorunludur.")]
        public string ShippingAddress { get; set; } = string.Empty;

        // Payment Info (In a real scenario, DO NOT store or handle this like this - use Stripe/Iyzico elements)
        [Required(ErrorMessage = "Kart numarası zorunludur.")]
        [RegularExpression(@"^\d{16}$", ErrorMessage = "Geçerli bir 16 haneli kart numarası giriniz.")]
        public string CardNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Son kullanma tarihi zorunludur.")]
        [RegularExpression(@"^(0[1-9]|1[0-2])\/?([0-9]{2})$", ErrorMessage = "AA/YY formatında son kullanma tarihi giriniz.")]
        public string ExpiryDate { get; set; } = string.Empty;

        [Required(ErrorMessage = "CVV zorunludur.")]
        [RegularExpression(@"^\d{3,4}$", ErrorMessage = "Geçerli bir CVV giriniz.")]
        public string Cvv { get; set; } = string.Empty;
    }
}
