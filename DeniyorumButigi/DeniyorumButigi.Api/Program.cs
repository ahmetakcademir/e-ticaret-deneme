using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

using FluentValidation;
using FluentValidation.AspNetCore;
using DeniyorumButigi.Api.Middleware;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters()
                .AddValidatorsFromAssemblyContaining<Program>(); // Loads all validators
builder.Services.AddEndpointsApiExplorer();

// Rate Limiting setup (Global IP bazlı)
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100, // 10 saniyede maks 100 istek
                QueueLimit = 0,
                Window = TimeSpan.FromSeconds(10)
            }));
    options.RejectionStatusCode = 429;
});

// CORS setup for Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger JWT configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Deniyorum Butiği API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// DbContext setup
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Iyzico Configuration Setup
builder.Services.Configure<DeniyorumButigi.Core.Entities.IyzicoOptions>(
    builder.Configuration.GetSection("IyzicoOptions"));

// Identity setup
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication setup
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddScoped<DeniyorumButigi.Core.Interfaces.ITokenService, DeniyorumButigi.Infrastructure.Services.TokenService>();
builder.Services.AddScoped(typeof(DeniyorumButigi.Core.Interfaces.IRepository<>), typeof(DeniyorumButigi.Infrastructure.Repositories.EfRepository<>));
builder.Services.AddScoped<DeniyorumButigi.Core.Interfaces.IBasketService, DeniyorumButigi.Infrastructure.Services.BasketService>();
builder.Services.AddScoped<DeniyorumButigi.Core.Interfaces.IPaymentService, DeniyorumButigi.Infrastructure.Services.IyzicoPaymentService>();
builder.Services.AddScoped<DeniyorumButigi.Core.Interfaces.IEmailService, DeniyorumButigi.Infrastructure.Services.MockEmailService>();
builder.Services.AddScoped<DeniyorumButigi.Core.Interfaces.IPhotoService>(provider =>  
{
    var env = provider.GetRequiredService<IWebHostEnvironment>();
    return new DeniyorumButigi.Infrastructure.Services.PhotoService(env.WebRootPath);
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseRateLimiter();

app.UseCors("AllowNextJs");

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(); // Allow serving images from wwwroot

app.MapControllers();

// Seed data via DbInitializer
try
{
    await DeniyorumButigi.Infrastructure.Data.DbInitializer.SeedAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Veritabanı başlangıç verileri (Seed) yüklenirken hata oluştu.");
}

app.Run();
