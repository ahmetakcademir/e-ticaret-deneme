using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Core.Entities
{
    public class Address : BaseEntity
    {
        [Required]
        public string AppUserId { get; set; } = string.Empty;
        
        public AppUser User { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Title { get; set; } = string.Empty; // e.g., "Ev", "İş"

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string District { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FullAddress { get; set; } = string.Empty;
    }
}
