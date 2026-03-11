using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IRepository<Category> _categoryRepo;

        public CategoriesController(IRepository<Category> categoryRepo)
        {
            _categoryRepo = categoryRepo;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories()
        {
            var categories = await _categoryRepo.ListAllAsync();
            var dtos = categories.Select(c => new CategoryDto(
                c.Id, 
                c.Name, 
                c.Slug, 
                c.ImageUrl, 
                c.Description, 
                c.DisplayOrder,
                c.ParentCategoryId)).ToList();

            return Ok(ApiResponse<IEnumerable<CategoryDto>>.Success(dtos));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(CreateCategoryDto request)
        {
            var category = new Category
            {
                Name = request.Name,
                Slug = request.Name.ToLower().Replace(" ", "-"), // Basit slug üretimi
                ImageUrl = request.ImageUrl,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder,
                ParentCategoryId = request.ParentCategoryId
            };

            var createdCategory = await _categoryRepo.AddAsync(category);

            var dto = new CategoryDto(
                createdCategory.Id, 
                createdCategory.Name, 
                createdCategory.Slug, 
                createdCategory.ImageUrl, 
                createdCategory.Description, 
                createdCategory.DisplayOrder,
                createdCategory.ParentCategoryId);

            return CreatedAtAction(nameof(GetCategories), new { id = createdCategory.Id }, ApiResponse<CategoryDto>.Success(dto, "Kategori başarıyla eklendi."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, CreateCategoryDto request)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null) return NotFound(ApiResponse<CategoryDto>.Fail("Kategori bulunamadı."));

            category.Name = request.Name;
            category.Slug = request.Name.ToLower().Replace(" ", "-");
            category.ImageUrl = request.ImageUrl;
            category.Description = request.Description;
            category.DisplayOrder = request.DisplayOrder;
            category.ParentCategoryId = request.ParentCategoryId;

            _categoryRepo.Update(category);
            await _categoryRepo.SaveChangesAsync();

            var dto = new CategoryDto(
                category.Id, 
                category.Name, 
                category.Slug, 
                category.ImageUrl, 
                category.Description, 
                category.DisplayOrder,
                category.ParentCategoryId);

            return Ok(ApiResponse<CategoryDto>.Success(dto, "Kategori başarıyla güncellendi."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteCategory(int id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null) return NotFound(ApiResponse<string>.Fail("Kategori bulunamadı."));

            _categoryRepo.Delete(category);
            await _categoryRepo.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success(null, "Kategori başarıyla silindi."));
        }
    }
}
