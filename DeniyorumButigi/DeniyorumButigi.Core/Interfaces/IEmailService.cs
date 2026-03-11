using System.Threading.Tasks;

namespace DeniyorumButigi.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
    }
}
