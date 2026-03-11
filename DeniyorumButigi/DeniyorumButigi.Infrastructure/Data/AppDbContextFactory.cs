using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DeniyorumButigi.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            // Using direct IPv4 for AWS pooler to bypass Windows DNS resolution bugs with SNI
            optionsBuilder.UseNpgsql("Host=18.198.30.239;Database=postgres;Username=postgres.dkvnaqnphayfqhvikwcl;Password=2020225013Ad.;Port=5432;Include Error Detail=true;");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
