using DeniyorumButigi.Core.Interfaces;
using System;
using System.IO;
using System.Threading.Tasks;

namespace DeniyorumButigi.Infrastructure.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly string _webRootPath;

        public PhotoService(string webRootPath)
        {
            _webRootPath = webRootPath;
        }

        public async Task<string> SavePhotoAsync(Stream fileStream, string fileName, string folderPath = "products")
        {
            if (fileStream == null || fileStream.Length == 0) return null;

            // Define the uploads folder path inside wwwroot
            var uploadsFolder = Path.Combine(_webRootPath, "images", folderPath);

            // Ensure directory exists
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(fileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file to the disk
            using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamOutput);
            }

            // Return relative url for database
            return $"/images/{folderPath}/" + uniqueFileName;
        }

        public void DeletePhoto(string photoUrl)
        {
            if (string.IsNullOrEmpty(photoUrl)) return;

            // photoUrl format is usually "/images/products/filename.jpg"
            var relativePath = photoUrl.TrimStart('/');
            var absolutePath = Path.Combine(_webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }
        }
    }
}
