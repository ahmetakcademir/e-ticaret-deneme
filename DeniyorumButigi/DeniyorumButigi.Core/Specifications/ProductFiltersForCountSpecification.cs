using DeniyorumButigi.Core.Entities;

namespace DeniyorumButigi.Core.Specifications
{
    public class ProductFiltersForCountSpecification : BaseSpecification<Product>
    {
        public ProductFiltersForCountSpecification(ProductSpecParams productParams)
            : base(x => 
                (string.IsNullOrEmpty(productParams.Search) || x.Name.ToLower().Contains(productParams.Search)) &&
                (!productParams.CategoryId.HasValue || x.CategoryId == productParams.CategoryId) &&
                (string.IsNullOrEmpty(productParams.Gender) || x.Gender == productParams.Gender)
            )
        {
        }
    }
}
