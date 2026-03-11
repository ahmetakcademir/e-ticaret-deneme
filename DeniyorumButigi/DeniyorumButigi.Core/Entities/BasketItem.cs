using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DeniyorumButigi.Core.Entities
{
    public class BasketItem : BaseEntity
    {
        [Required]
        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int Quantity { get; set; }
        
        public string? PictureUrl { get; set; }
        public string? SelectedSize { get; set; }
        public string? SelectedColor { get; set; }

        public int BasketId { get; set; }
        public Basket Basket { get; set; } = null!;
    }
}
