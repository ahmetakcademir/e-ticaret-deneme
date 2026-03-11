using System;
using System.Collections.Generic;

namespace DeniyorumButigi.Core.Entities
{
    public class Product : BaseEntity
    {
        public string Name { get; set; }
        public string Slug { get; set; }
        
        public decimal Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal CostPrice { get; set; }
        
        public bool IsPublished { get; set; } = true;
        public bool IsInStock { get; set; } = true;
        public int StockQuantity { get; set; }
        
        public string? Description { get; set; }
        public string? CareInstructions { get; set; }
        
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }

        // Cinsiyet / Bölüm (Kadın, Erkek, Unisex vb.)
        public string Gender { get; set; } = "Unisex";

        // Category Relation
        public int CategoryId { get; set; }
        public Category Category { get; set; }

        // Simple arrays for Multi-select equivalents mapping to EF Core (requires EF Core 8 primitive collections)
        public List<string> Sizes { get; set; } = new List<string>();
        public List<string> Colors { get; set; } = new List<string>();
        public List<string> ImageUrls { get; set; } = new List<string>();

        // Reviews Relation
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        
        // OrderItem Relation
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
