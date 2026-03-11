using DeniyorumButigi.Api.DTOs;
using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Entities;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;

        public AuthController(
            UserManager<AppUser> userManager, 
            SignInManager<AppUser> signInManager, 
            ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(RegisterRequestDto request)
        {
            if (await _userManager.FindByEmailAsync(request.Email) != null)
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Bu e-posta adresi zaten kullanımda."));
            }

            var user = new AppUser
            {
                Email = request.Email,
                UserName = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<AuthResponseDto>.Fail(errors, "Kayıt işlemi başarısız."));
            }

            var dto = new AuthResponseDto(
                await _tokenService.CreateToken(user),
                user.Email,
                user.FirstName,
                user.LastName
            );

            return Ok(ApiResponse<AuthResponseDto>.Success(dto, "Kayıt başarılı."));
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(LoginRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null) return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Geçersiz e-posta veya şifre."));

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

            if (!result.Succeeded) return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Geçersiz e-posta veya şifre."));

            var dto = new AuthResponseDto(
                await _tokenService.CreateToken(user),
                user.Email,
                user.FirstName,
                user.LastName
            );

            return Ok(ApiResponse<AuthResponseDto>.Success(dto, "Giriş başarılı."));
        }
    }
}
