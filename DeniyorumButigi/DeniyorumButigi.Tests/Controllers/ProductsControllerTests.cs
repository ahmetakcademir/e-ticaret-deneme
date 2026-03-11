using System.Threading.Tasks;
using DeniyorumButigi.Api.Controllers;
using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace DeniyorumButigi.Tests.Controllers
{
    public class ProductsControllerTests
    {
        private readonly Mock<IRepository<Product>> _mockRepo;
        private readonly ProductsController _controller;

        public ProductsControllerTests()
        {
            _mockRepo = new Mock<IRepository<Product>>();
            _controller = new ProductsController(_mockRepo.Object);
        }

        [Fact]
        public async Task GetProduct_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetEntityWithSpec(It.IsAny<ISpecification<Product>>()))
                     .ReturnsAsync((Product?)null);

            // Act
            var result = await _controller.GetProduct(99);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<ProductDto>>(notFoundResult.Value);
            
            Assert.False(apiResponse.IsSuccess);
            Assert.Contains("Ürün bulunamadı.", apiResponse.Errors);
        }

        [Fact]
        public async Task GetProduct_ReturnsOkWithProduct_WhenProductExists()
        {
            // Arrange
            var product = new Product
            {
                Id = 1,
                Name = "Test Product",
                Slug = "test-product",
                Price = 100m,
                Category = new Category { Id = 1, Name = "Test Category" }
            };

            _mockRepo.Setup(r => r.GetEntityWithSpec(It.IsAny<ISpecification<Product>>()))
                     .ReturnsAsync(product);

            // Act
            var result = await _controller.GetProduct(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<ApiResponse<ProductDto>>(okResult.Value);
            
            Assert.True(apiResponse.IsSuccess);
            Assert.NotNull(apiResponse.Data);
            Assert.Equal("Test Product", apiResponse.Data.Name);
            Assert.Equal(100m, apiResponse.Data.Price);
        }
    }
}
