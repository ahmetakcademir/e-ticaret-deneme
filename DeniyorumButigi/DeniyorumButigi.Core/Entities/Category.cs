using System.Collections.Generic;

namespace DeniyorumButigi.Core.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; }
        public string Slug { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        
        // Self-referencing for hierarchical categories
        public int? ParentCategoryId { get; set; }
        public Category? ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();

        public int DisplayOrder { get; set; }
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
