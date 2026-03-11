using System;
using System.Collections.Generic;

namespace DeniyorumButigi.Core.Entities
{
    public class Order : BaseEntity
    {
        public string OrderNumber { get; set; }
        
        // Customer Info
        public string CustomerFirstName { get; set; }
        public string CustomerLastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string ShippingAddress { get; set; }
        
        // Optional Link to Registered User
        public string? AppUserId { get; set; }
        
        public decimal TotalAmount { get; set; }
        
        // "Pending", "Approved", "Cancelled", "Shipped", "Delivered"
        public string PaymentStatus { get; set; } = "Pending";
        
        public string? TrackingNumber { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        // Items in this order
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public Order Order { get; set; }
        
        public int ProductId { get; set; }
        public Product Product { get; set; }
        
        public string ProductName { get; set; } // Snapshot of product name
        public string? SelectedSize { get; set; }
        public string? SelectedColor { get; set; }
        
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }
}
