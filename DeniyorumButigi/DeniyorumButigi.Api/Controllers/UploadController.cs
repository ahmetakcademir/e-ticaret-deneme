using DeniyorumButigi.Api.Responses;
using DeniyorumButigi.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DeniyorumButigi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IPhotoService _photoService;
        private readonly string[] ACCEPTED_FILE_TYPES = { ".jpg", ".jpeg", ".png", ".webp" };
        private const int MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

        public UploadController(IPhotoService photoService)
        {
            _photoService = photoService;
        }

        [HttpPost]
        [Authorize]
        [RequestSizeLimit(MAX_FILE_SIZE)]
        public async Task<ActionResult<ApiResponse<object>>> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(ApiResponse<object>.Fail("Dosya bulunamadı."));

            if (file.Length > MAX_FILE_SIZE)
                return BadRequest(ApiResponse<object>.Fail("Dosya boyutu 5 MB'dan büyük olamaz."));

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!ACCEPTED_FILE_TYPES.Contains(extension))
                return BadRequest(ApiResponse<object>.Fail("Sadece .jpg, .jpeg, .png ve .webp formatlarına izin verilmektedir."));

            using var stream = file.OpenReadStream();
            var url = await _photoService.SavePhotoAsync(stream, file.FileName, "products");

            if (string.IsNullOrEmpty(url))
                return StatusCode(500, ApiResponse<object>.Fail("Dosya kaydedilirken sunucuda bir hata oluştu."));

            // Returning an anonymous object to match frontend's expected { url: "..." } structure or standard ApiResponse
            // Some frontends might prefer standard DTO, but for flexibility we return standard format.
            return Ok(ApiResponse<object>.Success(new { url = url }, "Resim başarıyla yüklendi."));
        }

        [HttpDelete]
        [Authorize]
        public ActionResult<ApiResponse<string>> DeleteImage([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
                 return BadRequest(ApiResponse<string>.Fail("Silinecek dosya url'i belirtilmedi."));

            _photoService.DeletePhoto(url);
            
            return Ok(ApiResponse<string>.Success(null, "Resim başarıyla sistemden silindi."));
        }
    }
}
