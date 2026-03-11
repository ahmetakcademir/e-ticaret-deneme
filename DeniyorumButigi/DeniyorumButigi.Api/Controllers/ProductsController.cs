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
    public class ProductsController : ControllerBase
    {
        private readonly IRepository<Product> _productRepo;

        public ProductsController(IRepository<Product> productRepo)
        {
            _productRepo = productRepo;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<Helpers.Pagination<ProductDto>>>> GetProducts([FromQuery] Core.Specifications.ProductSpecParams productParams)
        {
            var spec = new Core.Specifications.ProductsWithCategoriesSpecification(productParams);
            var countSpec = new Core.Specifications.ProductFiltersForCountSpecification(productParams);
            
            var totalItems = await _productRepo.CountAsync(countSpec);
            var products = await _productRepo.ListAsync(spec);
            
            var dtos = products.Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Price,
                p.DiscountedPrice,
                p.CostPrice,
                p.IsInStock,
                p.StockQuantity,
                p.Gender,
                p.Description,
                p.MetaTitle,
                p.MetaDescription,
                p.CategoryId,
                p.Category?.Name,
                p.ImageUrls)).ToList();

            var paginationData = new Helpers.Pagination<ProductDto>(productParams.PageIndex, productParams.PageSize, totalItems, dtos);

            return Ok(ApiResponse<Helpers.Pagination<ProductDto>>.Success(paginationData));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> GetProduct(int id)
        {
            var spec = new Core.Specifications.ProductsWithCategoriesSpecification(id);
            var p = await _productRepo.GetEntityWithSpec(spec);
            
            if (p == null) return NotFound(ApiResponse<ProductDto>.Fail("Ürün bulunamadı."));

            var dto = new ProductDto(
                p.Id, p.Name, p.Slug, p.Price, p.DiscountedPrice, 
                p.CostPrice, p.IsInStock, p.StockQuantity, p.Gender,
                p.Description, p.MetaTitle, p.MetaDescription, p.CategoryId, p.Category?.Name, p.ImageUrls);

            return Ok(ApiResponse<ProductDto>.Success(dto));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct(CreateProductDto request)
        {
            var product = new Product
            {
                Name = request.Name,
                Slug = request.Name.ToLower().Replace(" ", "-"),
                Price = request.Price,
                DiscountedPrice = request.DiscountedPrice,
                CostPrice = request.CostPrice,
                StockQuantity = request.StockQuantity,
                Gender = request.Gender,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Sizes = request.Sizes ?? new List<string>(),
                Colors = request.Colors ?? new List<string>(),
                ImageUrls = request.ImageUrls ?? new List<string>()
            };

            var createdProduct = await _productRepo.AddAsync(product);

            var dto = new ProductDto(
                createdProduct.Id, createdProduct.Name, createdProduct.Slug, 
                createdProduct.Price, createdProduct.DiscountedPrice, 
                createdProduct.CostPrice, createdProduct.IsInStock, createdProduct.StockQuantity, createdProduct.Gender,
                createdProduct.Description, createdProduct.MetaTitle, createdProduct.MetaDescription, createdProduct.CategoryId, null, createdProduct.ImageUrls);

            return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, ApiResponse<ProductDto>.Success(dto, "Ürün başarıyla oluşturuldu."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(int id, CreateProductDto request)
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null) return NotFound(ApiResponse<ProductDto>.Fail("Ürün bulunamadı."));

            product.Name = request.Name;
            product.Slug = request.Name.ToLower().Replace(" ", "-");
            product.Price = request.Price;
            product.DiscountedPrice = request.DiscountedPrice;
            product.CostPrice = request.CostPrice;
            product.StockQuantity = request.StockQuantity;
            product.Gender = request.Gender;
            product.Description = request.Description;
            product.CategoryId = request.CategoryId;
            product.Sizes = request.Sizes ?? new List<string>();
            product.Colors = request.Colors ?? new List<string>();
            product.ImageUrls = request.ImageUrls ?? new List<string>();

            _productRepo.Update(product);
            await _productRepo.SaveChangesAsync();

            var dto = new ProductDto(
                product.Id, product.Name, product.Slug, 
                product.Price, product.DiscountedPrice, 
                product.CostPrice, product.IsInStock, product.StockQuantity, product.Gender,
                product.Description, product.MetaTitle, product.MetaDescription, product.CategoryId, null, product.ImageUrls);

            return Ok(ApiResponse<ProductDto>.Success(dto, "Ürün başarıyla güncellendi."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteProduct(int id)
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null) return NotFound(ApiResponse<string>.Fail("Ürün bulunamadı."));

            _productRepo.Delete(product);
            await _productRepo.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success(null, "Ürün başarıyla silindi."));
        }
    }
}
