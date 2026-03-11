using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public class AddressDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
    }

    public class CreateAddressDto
    {
        [Required(ErrorMessage = "Adres başlığı zorunludur.")]
        [MaxLength(50)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şehir bilgisi zorunludur.")]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "İlçe bilgisi zorunludur.")]
        [MaxLength(100)]
        public string District { get; set; } = string.Empty;

        [Required(ErrorMessage = "Açık adres zorunludur.")]
        [MaxLength(500)]
        public string FullAddress { get; set; } = string.Empty;
    }
}
