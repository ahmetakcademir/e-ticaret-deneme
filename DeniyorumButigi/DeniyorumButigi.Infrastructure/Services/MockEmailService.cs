using DeniyorumButigi.Core.Interfaces;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace DeniyorumButigi.Infrastructure.Services
{
    public class MockEmailService : IEmailService
    {
        private readonly ILogger<MockEmailService> _logger;

        public MockEmailService(ILogger<MockEmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            // Simulate sending an email by logging it. This keeps it simple without needing external SMTP.
            _logger.LogInformation("================ EMAİL GÖNDERİLDİ ================");
            _logger.LogInformation($"ALICI: {toEmail}");
            _logger.LogInformation($"KONU: {subject}");
            _logger.LogInformation($"İÇERİK (Kısa): {htmlContent.Substring(0, System.Math.Min(htmlContent.Length, 150))}...");
            _logger.LogInformation("==================================================");
            
            return Task.CompletedTask;
        }
    }
}
