using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;

namespace DeniyorumButigi.Infrastructure.Services
{
    public class MockPaymentService : IPaymentService
    {
        public async Task<bool> ProcessPaymentAsync(Basket basket, string cardNumber, string expiryDate, string cvv)
        {
            // Simulate payment gateway delay
            await Task.Delay(1500);

            // Simulating failure conditions for testing
            if (cardNumber.StartsWith("4444") || cvv == "000")
            {
                return false; // Ödeme başarısız simülasyonu
            }

            if (basket.Items == null || !basket.Items.Any())
            {
                throw new InvalidOperationException("Sepetiniz boş.");
            }

            // Simulating a successful payment
            return true;
        }
    }
}
