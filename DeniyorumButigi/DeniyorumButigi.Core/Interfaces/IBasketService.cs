using DeniyorumButigi.Core.Entities;

namespace DeniyorumButigi.Core.Interfaces
{
    public interface IBasketService
    {
        Task<Basket> GetBasketAsync(string buyerId);
        Task<Basket> AddItemToBasketAsync(string buyerId, int productId, int quantity, string? size = null, string? color = null);
        Task<Basket> RemoveItemFromBasketAsync(string buyerId, int productId);
        Task<bool> DeleteBasketAsync(string buyerId);
    }
}
