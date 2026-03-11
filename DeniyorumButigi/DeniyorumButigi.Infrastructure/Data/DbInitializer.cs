using DeniyorumButigi.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DeniyorumButigi.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

            try
            {
                logger.LogInformation("Veritabanı migration'ları kontrol ediliyor...");
                await context.Database.MigrateAsync();

                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

                string[] roleNames = { "Admin", "User" };
                foreach (var roleName in roleNames)
                {
                    if (!await roleManager.RoleExistsAsync(roleName))
                    {
                        await roleManager.CreateAsync(new IdentityRole(roleName));
                        logger.LogInformation($"Rol '{roleName}' oluşturuldu.");
                    }
                }

                string adminEmail = "admin@butik.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    adminUser = new AppUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FirstName = "Admin",
                        LastName = "Yönetici"
                    };
                    var result = await userManager.CreateAsync(adminUser, "Admin123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        logger.LogInformation("Admin hesabı oluşturuldu ve yetkilendirildi.");
                    }
                    else
                    {
                        logger.LogWarning("Admin hesabı oluşturulurken hata: " + string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }

                if (!await context.Categories.AnyAsync())
                {
                    logger.LogInformation("Kategoriler boş, test kategorileri ekleniyor...");
                    
                    var categories = new List<Category>
                    {
                        new Category { Name = "Kadın Giyim", Slug = "kadin-giyim" },
                        new Category { Name = "Erkek Giyim", Slug = "erkek-giyim" },
                        new Category { Name = "Ayakkabı", Slug = "ayakkabi" },
                        new Category { Name = "Çanta", Slug = "canta" },
                        new Category { Name = "Aksesuar", Slug = "aksesuar" }
                    };

                    await context.Categories.AddRangeAsync(categories);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Kategoriler başarıyla oluşturuldu.");
                }

                if (await context.Products.AnyAsync())
                {
                    logger.LogInformation("Veritabanındaki eski ürünler temizleniyor...");
                    context.Products.RemoveRange(context.Products);
                    await context.SaveChangesAsync();
                }

                logger.LogInformation("Ürünler boşaltıldı, 25 adet test ürünü (resimli) ekleniyor...");
                    
                var kadinKatId = await context.Categories.Where(c => c.Name == "Kadın Giyim").Select(c => c.Id).FirstOrDefaultAsync();
                    var erkekKatId = await context.Categories.Where(c => c.Name == "Erkek Giyim").Select(c => c.Id).FirstOrDefaultAsync();
                    var ayakKatId = await context.Categories.Where(c => c.Name == "Ayakkabı").Select(c => c.Id).FirstOrDefaultAsync();
                    var cantaKatId = await context.Categories.Where(c => c.Name == "Çanta").Select(c => c.Id).FirstOrDefaultAsync();
                    var akseKatId = await context.Categories.Where(c => c.Name == "Aksesuar").Select(c => c.Id).FirstOrDefaultAsync();

                    var products = new List<Product>();
                    var random = new Random(42);

                    // --- Kadın Kış (25 items) ---
                    string[] wWinterImgs = { "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1550614000-4b95d4edae1f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1578587018452-892bace94f12?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=800&auto=format&fit=crop" };
                    string[] wWinterNames = { "Oversize Kaşe Kaban", "Premium Yün Triko", "Boğazlı Kazak", "Kürk Detaylı Mont", "Uzun Şişme Mont" };

                    // --- Kadın Essentials (25 items) ---
                    string[] wEssImgs = { "https://images.unsplash.com/photo-1618244972963-cb601d51a02f?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1434389678241-17fe42ec405a?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1623330188314-8f4645626731?w=800&auto=format&fit=crop" };
                    string[] wEssNames = { "Basic Pamuklu Tişört", "Yüksek Bel Mom Jean", "Sade Ribanalı Atlet", "Günlük Tayt", "Midi Basic Etek" };

                    // --- Kadın Gece Şıklığı (25 items) ---
                    string[] wEveImgs = { "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1564222256577-45e728f2c611?w=800&auto=format&fit=crop" };
                    string[] wEveNames = { "Saten Gece Elbisesi", "Yırtmaçlı Abiye", "Payetli Mini Elbise", "Kadife Şık Tulum", "Dantel İşlemeli Elbise" };

                    // --- Erkek Kış (25 items) ---
                    string[] mWinterImgs = { "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1495105787522-5334e3ffa0eb?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop" };
                    string[] mWinterNames = { "Hakiki Deri Ceket", "Yünlü Palto", "Premium Triko Kazak", "Şık Şişme Yelek", "Kışlık Kalın Kaşe" };

                    // --- Erkek Essentials (25 items) ---
                    string[] mEssImgs = { "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop" };
                    string[] mEssNames = { "Premium Basic Tişört", "Rahat Kesim Jean", "Polo Yaka Tişört", "Sade Kapüşonlu", "Günlük Eşofman Altı" };

                    // --- Erkek Özel Davet (25 items) ---
                    string[] mEveImgs = { "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1594938298595-502a4bf74dd3?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1614252209825-962f928a3074?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop" };
                    string[] mEveNames = { "Slim Fit Takım Elbise", "İtalyan Kesim Smokin", "Şık Keten Ceket", "Özel Dikim Pantolon", "Klasik Yelekli Takım" };

                    void GenerateSet(int catId, string[] names, string[] images, int minP, int maxP, string collectionTag) {
                        for(int i = 1; i <= 25; i++)
                        {
                            var baseName = names[i % names.Length];
                            var price = minP + random.Next(maxP - minP) + 0.90m;
                            var rndGuid = Guid.NewGuid().ToString().Substring(0, 5);
                            var slug = $"{baseName.ToLower().Replace(" ", "-").Replace("ç", "c").Replace("ş", "s").Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u").Replace("ö", "o")}-{rndGuid}";
                            
                            products.Add(new Product {
                                Name = $"{baseName} Serisi #{i}",
                                Slug = slug,
                                Price = price,
                                DiscountedPrice = (i % 4 == 0) ? Math.Round(price * 0.85m, 2) : null,
                                Description = $"{baseName} koleksiyonunun en sevilen parçalarından. {collectionTag}",
                                Sizes = new List<string> { "S", "M", "L", "XL" },
                                Colors = new List<string> { "Siyah", "Vizon", "Antrasit", "Krem" },
                                ImageUrls = new List<string> { images[i % images.Length] },
                                CategoryId = catId,
                                IsPublished = true,
                                IsInStock = true
                            });
                        }
                    }

                    GenerateSet(kadinKatId, wWinterNames, wWinterImgs, 500, 1500, "Kış Koleksiyonu - Soğuklarda içinizi ısıtacak şık tasarım.");
                    GenerateSet(kadinKatId, wEssNames, wEssImgs, 200, 600, "Essentials Koleksiyonu - Dolabınızın vazgeçilmez temel parçası.");
                    GenerateSet(kadinKatId, wEveNames, wEveImgs, 1500, 4000, "Gece Koleksiyonu - Özel davetlerde tüm gözler üzerinizde olsun.");

                    GenerateSet(erkekKatId, mWinterNames, mWinterImgs, 500, 1500, "Kış Koleksiyonu - Karizmanızdan ödün vermeden sıcak kalın.");
                    GenerateSet(erkekKatId, mEssNames, mEssImgs, 200, 600, "Essentials Koleksiyonu - Şehrin dinamizmine ayak uyduran net tasarım.");
                    GenerateSet(erkekKatId, mEveNames, mEveImgs, 1500, 4000, "Davet Koleksiyonu - Güçlü duruşun ve zarafetin yansıması.");

                    await context.Products.AddRangeAsync(products);
                    await context.SaveChangesAsync();
                    
                    logger.LogInformation("150 Adet Gerçekçi Test Ürünü (Dinamik) başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Veritabanına başlangıç verileri eklenirken bir hata oluştu.");
            }
        }
    }
}
