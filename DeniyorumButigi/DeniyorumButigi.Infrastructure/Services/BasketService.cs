using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using DeniyorumButigi.Infrastructure.Data;

namespace DeniyorumButigi.Infrastructure.Services
{
    public class BasketService : IBasketService
    {
        private readonly AppDbContext _context;

        public BasketService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Basket> GetBasketAsync(string buyerId)
        {
            var basket = await _context.Baskets
                .Include(b => b.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(b => b.BuyerId == buyerId);

            if (basket == null)
            {
                basket = new Basket { BuyerId = buyerId };
                _context.Baskets.Add(basket);
                await _context.SaveChangesAsync();
            }

            return basket;
        }

        public async Task<Basket> AddItemToBasketAsync(string buyerId, int productId, int quantity, string? size = null, string? color = null)
        {
            var basket = await GetBasketAsync(buyerId);
            
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new Exception("Ürün bulunamadı.");

            var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == productId && i.SelectedSize == size && i.SelectedColor == color);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
            }
            else
            {
                var price = product.DiscountedPrice ?? product.Price;
                var imageUrl = product.ImageUrls != null && product.ImageUrls.Any() ? product.ImageUrls.First() : null;

                basket.Items.Add(new BasketItem
                {
                    ProductId = productId,
                    ProductName = product.Name,
                    Price = price,
                    Quantity = quantity,
                    PictureUrl = imageUrl,
                    SelectedSize = size,
                    SelectedColor = color
                });
            }

            await _context.SaveChangesAsync();
            return basket;
        }

        public async Task<Basket> RemoveItemFromBasketAsync(string buyerId, int productId)
        {
            var basket = await GetBasketAsync(buyerId);
            var item = basket.Items.FirstOrDefault(i => i.ProductId == productId);

            if (item != null)
            {
                basket.Items.Remove(item);
                await _context.SaveChangesAsync();
            }

            return basket;
        }

        public async Task<bool> DeleteBasketAsync(string buyerId)
        {
            var basket = await _context.Baskets.FirstOrDefaultAsync(b => b.BuyerId == buyerId);
            if (basket == null) return false;

            _context.Baskets.Remove(basket);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
