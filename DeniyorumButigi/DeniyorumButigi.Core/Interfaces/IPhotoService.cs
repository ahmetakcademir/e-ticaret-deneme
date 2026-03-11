using System.IO;
using System.Threading.Tasks;

namespace DeniyorumButigi.Core.Interfaces
{
    public interface IPhotoService
    {
        Task<string> SavePhotoAsync(Stream fileStream, string fileName, string folderPath = "products");
        void DeletePhoto(string photoUrl);
    }
}
