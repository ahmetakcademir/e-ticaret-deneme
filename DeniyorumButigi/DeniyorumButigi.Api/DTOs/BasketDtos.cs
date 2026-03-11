using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public class BasketItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? PictureUrl { get; set; }
        public string? SelectedSize { get; set; }
        public string? SelectedColor { get; set; }
    }

    public class BasketDto
    {
        public string BuyerId { get; set; } = string.Empty;
        public List<BasketItemDto> Items { get; set; } = new List<BasketItemDto>();
        public decimal Total => Items.Sum(i => i.Price * i.Quantity);
    }

    public class BasketItemAddDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Miktar en az 1 olmalıdır.")]
        public int Quantity { get; set; }

        public string? Size { get; set; }
        public string? Color { get; set; }
    }
}
