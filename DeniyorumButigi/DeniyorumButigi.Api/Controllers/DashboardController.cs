using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Category> _categoryRepo;
        private readonly IRepository<Order> _orderRepo;

        public DashboardController(
            IRepository<Product> productRepo,
            IRepository<Category> categoryRepo,
            IRepository<Order> orderRepo)
        {
            _productRepo = productRepo;
            _categoryRepo = categoryRepo;
            _orderRepo = orderRepo;
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<object>>> GetStats()
        {
            var products = await _productRepo.ListAllAsync();
            var categories = await _categoryRepo.ListAllAsync();
            var orders = await _orderRepo.ListAllAsync();

            var stats = new
            {
                TotalProducts = products.Count,
                OutOfStockCount = products.Count(p => !p.IsInStock),
                TotalCategories = categories.Count,
                TotalOrders = orders.Count,
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                PendingOrders = orders.Count(o => o.PaymentStatus == "Pending")
            };

            return Ok(ApiResponse<object>.Success(stats));
        }
    }
}
