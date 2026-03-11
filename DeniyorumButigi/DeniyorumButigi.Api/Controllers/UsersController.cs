using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Sadece giriş yapmış kullanıcılar kendi profilini ve adreslerini yönetebilir
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IRepository<Address> _addressRepo;

        public UsersController(UserManager<AppUser> userManager, IRepository<Address> addressRepo)
        {
            _userManager = userManager;
            _addressRepo = addressRepo;
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<ApiResponse<object>>> GetProfile()
        {
            var user = await _userManager.FindByIdAsync(GetUserId());
            if (user == null) return NotFound(ApiResponse<object>.Fail("Kullanıcı bulunamadı."));

            var profile = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email
            };

            return Ok(ApiResponse<object>.Success(profile));
        }

        // --- Adres Yönetimi ---

        [HttpGet("addresses")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AddressDto>>>> GetAddresses()
        {
            var userId = GetUserId();
            var allAddresses = await _addressRepo.ListAllAsync(); // In real app, we would use a Specification to filter by AppUserId
            var userAddresses = allAddresses.Where(a => a.AppUserId == userId).ToList();

            var dtos = userAddresses.Select(a => new AddressDto
            {
                Id = a.Id,
                Title = a.Title,
                City = a.City,
                District = a.District,
                FullAddress = a.FullAddress
            }).ToList();

            return Ok(ApiResponse<IEnumerable<AddressDto>>.Success(dtos));
        }

        [HttpPost("addresses")]
        public async Task<ActionResult<ApiResponse<AddressDto>>> AddAddress(CreateAddressDto request)
        {
            var userId = GetUserId();

            var address = new Address
            {
                AppUserId = userId,
                Title = request.Title,
                City = request.City,
                District = request.District,
                FullAddress = request.FullAddress
            };

            var createdAddress = await _addressRepo.AddAsync(address);

            var dto = new AddressDto
            {
                Id = createdAddress.Id,
                Title = createdAddress.Title,
                City = createdAddress.City,
                District = createdAddress.District,
                FullAddress = createdAddress.FullAddress
            };

            return CreatedAtAction(nameof(GetAddresses), new { id = createdAddress.Id }, ApiResponse<AddressDto>.Success(dto, "Adres başarıyla eklendi."));
        }

        [HttpDelete("addresses/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteAddress(int id)
        {
            var address = await _addressRepo.GetByIdAsync(id);
            var userId = GetUserId();

            if (address == null || address.AppUserId != userId)
            {
                return NotFound(ApiResponse<string>.Fail("Adres bulunamadı veya bu silme işlemi için yetkiniz yok."));
            }

            _addressRepo.Delete(address);
            await _addressRepo.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success("Adres başarıyla silindi.", "Başarılı"));
        }
    }
}
