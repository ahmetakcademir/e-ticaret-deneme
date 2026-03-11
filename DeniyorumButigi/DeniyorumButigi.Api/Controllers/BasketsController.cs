using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BasketsController : ControllerBase
    {
        private readonly IBasketService _basketService;

        public BasketsController(IBasketService basketService)
        {
            _basketService = basketService;
        }

        private string GetBuyerId()
        {
            // Simple logic: if user is authenticated, use their id. Otherwise, use guest id from request.
            if (User.Identity?.IsAuthenticated == true)
            {
                return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? Request.Cookies["buyerId"] ?? GenerateBuyerId();
            }

            return Request.Cookies["buyerId"] ?? GenerateBuyerId();
        }

        private string GenerateBuyerId()
        {
            var buyerId = Guid.NewGuid().ToString();
            var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Today.AddDays(30) };
            Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            return buyerId;
        }

        private BasketDto MapBasketToDto(Basket basket)
        {
            return new BasketDto
            {
                BuyerId = basket.BuyerId,
                Items = basket.Items.Select(i => new BasketItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    PictureUrl = i.PictureUrl,
                    SelectedColor = i.SelectedColor,
                    SelectedSize = i.SelectedSize
                }).ToList()
            };
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<BasketDto>>> GetBasket()
        {
            var buyerId = GetBuyerId();
            var basket = await _basketService.GetBasketAsync(buyerId);
            return Ok(ApiResponse<BasketDto>.Success(MapBasketToDto(basket)));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<BasketDto>>> AddItemToBasket(BasketItemAddDto itemDto)
        {
            try
            {
                var buyerId = GetBuyerId();
                var basket = await _basketService.AddItemToBasketAsync(buyerId, itemDto.ProductId, itemDto.Quantity, itemDto.Size, itemDto.Color);
                return Ok(ApiResponse<BasketDto>.Success(MapBasketToDto(basket), "Ürün sepete eklendi."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<BasketDto>.Fail(ex.Message));
            }
        }

        [HttpDelete("{productId}")]
        public async Task<ActionResult<ApiResponse<BasketDto>>> RemoveBasketItem(int productId)
        {
            var buyerId = GetBuyerId();
            var basket = await _basketService.RemoveItemFromBasketAsync(buyerId, productId);
            return Ok(ApiResponse<BasketDto>.Success(MapBasketToDto(basket), "Ürün sepetten çıkarıldı."));
        }

        [HttpDelete]
        public async Task<ActionResult<ApiResponse<string>>> DeleteBasket()
        {
            var buyerId = GetBuyerId();
            var result = await _basketService.DeleteBasketAsync(buyerId);
            if (!result) return NotFound(ApiResponse<string>.Fail("Sepet bulunamadı."));

            Response.Cookies.Delete("buyerId");
            return Ok(ApiResponse<string>.Success("Sepet temizlendi.", "Başarılı"));
        }
    }
}
