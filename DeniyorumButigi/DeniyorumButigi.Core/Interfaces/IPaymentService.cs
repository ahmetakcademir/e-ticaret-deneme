using DeniyorumButigi.Core.Entities;

namespace DeniyorumButigi.Core.Interfaces
{
    public interface IPaymentService
    {
        Task<bool> ProcessPaymentAsync(Basket basket, string cardNumber, string expiryDate, string cvv);
    }
}
