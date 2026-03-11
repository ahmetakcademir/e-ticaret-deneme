using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public record ProductDto(
        int Id, 
        string Name, 
        string Slug, 
        decimal Price, 
        decimal? DiscountedPrice,
        decimal CostPrice,
        bool IsInStock,
        int StockQuantity,
        string Gender,
        string? Description,
        string? MetaTitle,
        string? MetaDescription,
        int CategoryId,
        string? CategoryName,
        List<string> ImageUrls)
    {
        public string? ThumbnailUrl => ImageUrls?.Count > 0 ? ImageUrls[0] : null;
    }

    public record CreateProductDto(
        [Required] string Name, 
        [Range(0.1, 100000)] decimal Price, 
        decimal? DiscountedPrice,
        decimal CostPrice,
        int StockQuantity,
        string Gender,
        string? Description,
        List<string> Sizes,
        List<string> Colors,
        List<string> ImageUrls,
        [Required] int CategoryId);
}
