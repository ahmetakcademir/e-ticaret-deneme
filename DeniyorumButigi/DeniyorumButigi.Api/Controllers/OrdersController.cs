using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using DeniyorumButigi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IRepository<Order> _orderRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IBasketService _basketService;
        private readonly IPaymentService _paymentService;
        private readonly AppDbContext _dbContext;
        private readonly IEmailService _emailService;

        public OrdersController(IRepository<Order> orderRepo, 
            IRepository<Product> productRepo, 
            IBasketService basketService, 
            IPaymentService paymentService, 
            AppDbContext dbContext,
            IEmailService emailService)
        {
            _orderRepo = orderRepo;
            _productRepo = productRepo;
            _basketService = basketService;
            _paymentService = paymentService;
            _dbContext = dbContext;
            _emailService = emailService;
        }

        private string GetBuyerId()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? Request.Cookies["buyerId"] ?? throw new UnauthorizedAccessException("Geçersiz kullanıcı yetkisi.");
            }
            return Request.Cookies["buyerId"] ?? throw new Exception("Aktif bir sepet bulunamadı.");
        }

        /// <summary>
        /// Direct checkout - accepts cart items from the frontend directly (no backend basket needed).
        /// This is for guest users who manage their cart on the client side.
        /// </summary>
        [HttpPost("checkout")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> DirectCheckout([FromBody] DirectCheckoutRequestDto request)
        {
            try
            {
                if (request.Items == null || !request.Items.Any())
                    return BadRequest(ApiResponse<OrderDto>.Fail("Sepetiniz boş. Satın alma işlemi yapılamaz."));

                // Parse the full name into first/last
                var nameParts = (request.CustomerName ?? "Misafir Kullanıcı").Trim().Split(' ', 2);
                var firstName = nameParts[0];
                var lastName = nameParts.Length > 1 ? nameParts[1] : "";

                // Get AppUserId if authenticated
                var appUserId = User.Identity?.IsAuthenticated == true
                    ? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    : null;

                var order = new Order
                {
                    OrderNumber = "DB-" + Guid.NewGuid().ToString().Substring(0, 6).ToUpper(),
                    CustomerFirstName = firstName,
                    CustomerLastName = lastName,
                    Email = request.CustomerEmail ?? "misafir@deniyorumbutigi.com",
                    Phone = request.CustomerPhone ?? "05001234567",
                    ShippingAddress = request.ShippingAddress ?? "Belirtilmedi",
                    AppUserId = appUserId,
                    PaymentStatus = "Paid",
                    TotalAmount = 0
                };

                foreach (var item in request.Items)
                {
                    // Update Product Stock
                    var product = await _productRepo.GetByIdAsync(item.ProductId);
                    if (product == null)
                        return BadRequest(ApiResponse<OrderDto>.Fail($"Ürün bulunamadı (ID: {item.ProductId})."));

                    if (product.StockQuantity < item.Quantity)
                        return BadRequest(ApiResponse<OrderDto>.Fail($"'{product.Name}' için yeterli stok yok. Mevcut stok: {product.StockQuantity}"));

                    product.StockQuantity -= item.Quantity;
                    product.IsInStock = product.StockQuantity > 0;
                    _productRepo.Update(product);
                    await _productRepo.SaveChangesAsync();

                    var unitPrice = item.UnitPrice;

                    order.TotalAmount += unitPrice * item.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = item.ProductName ?? product.Name,
                        UnitPrice = unitPrice,
                        Quantity = item.Quantity,
                        SelectedSize = item.SelectedSize,
                        SelectedColor = item.SelectedColor
                    };

                    order.OrderItems.Add(orderItem);
                }

                var createdOrder = await _orderRepo.AddAsync(order);

                var dto = new OrderDto(
                    createdOrder.Id,
                    createdOrder.OrderNumber,
                    createdOrder.CustomerFirstName,
                    createdOrder.CustomerLastName,
                    createdOrder.TotalAmount,
                    createdOrder.PaymentStatus,
                    createdOrder.OrderDate,
                    createdOrder.OrderItems.Select(oi => new OrderItemDto(
                        oi.ProductId, oi.ProductName, oi.Quantity, oi.UnitPrice, oi.SelectedSize, oi.SelectedColor
                    )).ToList()
                );

                // Send Confirmation Email
                var emailHtml = $@"
                    <h1>Siparişiniz Alındı!</h1>
                    <p>Sayın {createdOrder.CustomerFirstName} {createdOrder.CustomerLastName},</p>
                    <p><b>{createdOrder.OrderNumber}</b> numaralı siparişiniz başarıyla oluşturuldu.</p>
                    <p>Toplam Tutar: <b>{createdOrder.TotalAmount:C2}</b></p>
                    <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>";
                
                await _emailService.SendEmailAsync(createdOrder.Email, $"Sipariş Onayı - {createdOrder.OrderNumber}", emailHtml);

                return Ok(ApiResponse<OrderDto>.Success(dto, "Sipariş başarıyla oluşturuldu!"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<OrderDto>.Fail($"Sipariş işlemi başarısız: {ex.Message}"));
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<OrderDto>>>> GetOrders()
        {
            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var dtos = orders.Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.CustomerFirstName,
                o.CustomerLastName,
                o.TotalAmount,
                o.PaymentStatus,
                o.OrderDate,
                o.OrderItems.Select(oi => new OrderItemDto(
                    oi.ProductId, oi.ProductName, oi.Quantity, oi.UnitPrice, oi.SelectedSize, oi.SelectedColor
                )).ToList()
            )).ToList();

            return Ok(ApiResponse<IEnumerable<OrderDto>>.Success(dtos));
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<IEnumerable<OrderDto>>>> GetMyOrders()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.AppUserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var dtos = orders.Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.CustomerFirstName,
                o.CustomerLastName,
                o.TotalAmount,
                o.PaymentStatus,
                o.OrderDate,
                o.OrderItems.Select(oi => new OrderItemDto(
                    oi.ProductId, oi.ProductName, oi.Quantity, oi.UnitPrice, oi.SelectedSize, oi.SelectedColor
                )).ToList()
            )).ToList();

            return Ok(ApiResponse<IEnumerable<OrderDto>>.Success(dtos));
        }
    }

    /// <summary>
    /// DTO for direct checkout from client-side cart
    /// </summary>
    public class DirectCheckoutRequestDto
    {
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? ShippingAddress { get; set; }
        public string? CardNumber { get; set; }
        public string? CardExpiry { get; set; }
        public string? CardCvc { get; set; }
        public List<DirectCheckoutItemDto> Items { get; set; } = new();
    }

    public class DirectCheckoutItemDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? SelectedSize { get; set; }
        public string? SelectedColor { get; set; }
    }
}
