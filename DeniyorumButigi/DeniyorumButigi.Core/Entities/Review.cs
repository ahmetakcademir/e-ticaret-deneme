using System;

namespace DeniyorumButigi.Core.Entities
{
    public class Review : BaseEntity
    {
        public int ProductId { get; set; }
        public Product Product { get; set; }

        public string UserName { get; set; }
        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
        
        public int Rating { get; set; } // 1-5
        public string? ReviewText { get; set; }
        
        // Status: "Approved", "Pending", "Rejected"
        public string Status { get; set; } = "Pending";
    }
}
