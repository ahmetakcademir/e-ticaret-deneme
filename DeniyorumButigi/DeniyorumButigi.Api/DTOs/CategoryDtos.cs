using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public record CategoryDto(int Id, string Name, string Slug, string? ImageUrl, string? Description, int DisplayOrder, int? ParentCategoryId);

    public record CreateCategoryDto(
        [Required] string Name, 
        string? ImageUrl, 
        string? Description, 
        int DisplayOrder = 0,
        int? ParentCategoryId = null);
}
