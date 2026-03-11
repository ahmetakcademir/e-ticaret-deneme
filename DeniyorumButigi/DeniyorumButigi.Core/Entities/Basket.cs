using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Core.Entities
{
    public class Basket : BaseEntity
    {
        [Required]
        public string BuyerId { get; set; } = string.Empty;

        public List<BasketItem> Items { get; set; } = new List<BasketItem>();
    }
}
