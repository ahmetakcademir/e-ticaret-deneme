using DeniyorumButigi.Core.Entities;

namespace DeniyorumButigi.Core.Interfaces
{
    public interface ITokenService
    {
        Task<string> CreateToken(AppUser user);
    }
}
