using Microsoft.AspNetCore.Identity;

namespace DeniyorumButigi.Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public ICollection<Address> Addresses { get; set; } = new List<Address>();
    }
}
