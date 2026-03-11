using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Iyzipay;
using Iyzipay.Model;
using Iyzipay.Request;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basket = DeniyorumButigi.Core.Entities.Basket;
using Address = DeniyorumButigi.Core.Entities.Address;

namespace DeniyorumButigi.Infrastructure.Services
{
    public class IyzicoPaymentService : IPaymentService
    {
        private readonly Iyzipay.Options _options;

        public IyzicoPaymentService(IOptions<IyzicoOptions> iyzicoOptions)
        {
            _options = new Iyzipay.Options
            {
                ApiKey = iyzicoOptions.Value.ApiKey,
                SecretKey = iyzicoOptions.Value.SecretKey,
                BaseUrl = iyzicoOptions.Value.BaseUrl
            };
        }

        public async Task<bool> ProcessPaymentAsync(Basket basket, string cardNumber, string expiryDate, string cvv)
        {
            if (basket == null || !basket.Items.Any()) throw new InvalidOperationException("Sepetiniz boş.");

            var request = new CreatePaymentRequest
            {
                Locale = Locale.TR.ToString(),
                ConversationId = Guid.NewGuid().ToString(),
                Price = basket.Items.Sum(i => i.Price * i.Quantity).ToString("0.00").Replace(",", "."),
                PaidPrice = basket.Items.Sum(i => i.Price * i.Quantity).ToString("0.00").Replace(",", "."),
                Currency = Currency.TRY.ToString(),
                Installment = 1,
                BasketId = basket.Id.ToString(),
                PaymentChannel = PaymentChannel.WEB.ToString(),
                PaymentGroup = PaymentGroup.PRODUCT.ToString(),
            };

            var month = expiryDate.Split('/')[0].Trim();
            var year = expiryDate.Split('/')[1].Trim();
            if (year.Length == 2) year = "20" + year;

            request.PaymentCard = new PaymentCard
            {
                CardHolderName = "Ahmet Can", // Normally passed from Frontend
                CardNumber = cardNumber.Replace(" ", ""),
                ExpireMonth = month,
                ExpireYear = year,
                Cvc = cvv,
                RegisterCard = 0
            };

            // Buyer details (Ideally comes from Identity or Request)
            request.Buyer = new Buyer
            {
                Id = "BY789",
                Name = "Ahmet",
                Surname = "Can",
                GsmNumber = "+905324000000",
                Email = "email@email.com",
                IdentityNumber = "74300864791",
                LastLoginDate = "2023-10-06 00:00:00",
                RegistrationDate = "2023-10-06 00:00:00",
                RegistrationAddress = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
                Ip = "85.34.78.112",
                City = "Istanbul",
                Country = "Turkey",
                ZipCode = "34732"
            };

            var address = new Iyzipay.Model.Address
            {
                ContactName = "Ahmet Can",
                City = "Istanbul",
                Country = "Turkey",
                Description = "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
                ZipCode = "34732"
            };

            request.ShippingAddress = address;
            request.BillingAddress = address;

            var basketItems = new List<Iyzipay.Model.BasketItem>();
            foreach (var item in basket.Items)
            {
                var iyziItem = new Iyzipay.Model.BasketItem
                {
                    Id = item.ProductId.ToString(),
                    Name = item.ProductName,
                    Category1 = "Clothing",
                    Category2 = "Apparel",
                    ItemType = BasketItemType.PHYSICAL.ToString(),
                    Price = (item.Price * item.Quantity).ToString("0.00").Replace(",", ".")
                };
                basketItems.Add(iyziItem);
            }

            request.BasketItems = basketItems;

            // Network call handled asynchronously by wrapping synchronous Iyzico SDK
            var payment = await Task.Run(() => Payment.Create(request, _options));

            if (payment.Status == "success")
            {
                return true;
            }
            else
            {
                throw new Exception($"İyzico Hatası: {payment.ErrorMessage}");
            }
        }
    }
}
