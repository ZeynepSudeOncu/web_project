using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public AdminProductsController(LogisticsDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/admin/products/summary
    // Ürün bazlı TOPLAM stok
    // =====================================================
    [HttpGet("summary")]
    public async Task<IActionResult> GetProductSummary()
    {
        // Depo stokları
        var depotStocks =
            from dp in _context.DepotProducts
            group dp by dp.ProductId into g
            select new
            {
                ProductId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            };

        // Mağaza stokları
        var storeStocks =
            from sp in _context.StoreProduct
            group sp by sp.ProductId into g
            select new
            {
                ProductId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            };

        var merged =
            from p in _context.Products
            join ds in depotStocks on p.Id equals ds.ProductId into dsg
            from ds in dsg.DefaultIfEmpty()
            join ss in storeStocks on p.Id equals ss.ProductId into ssg
            from ss in ssg.DefaultIfEmpty()
            select new
            {
                productId = p.Id,
                productName = p.Name,
                productCode = p.Code,
                totalQuantity =
                    (ds != null ? ds.Quantity : 0) +
                    (ss != null ? ss.Quantity : 0)
            };

        return Ok(await merged
            .OrderBy(x => x.productCode)
            .ToListAsync());
    }

    // =====================================================
// GET: api/admin/products/{productId}/details
// Ürünün depo + mağaza kırılımı
// =====================================================
[HttpGet("{productId:guid}/details")]
public async Task<IActionResult> GetProductDetails(Guid productId)
{
    var depots =
        from dp in _context.DepotProducts
        join d in _context.Depots on dp.DepotId equals d.Id
        where dp.ProductId == productId
        select new
        {
            depotId = d.Id,
            depotName = d.Name,
            quantity = dp.Quantity
        };

    var stores =
        from sp in _context.StoreProduct
        join s in _context.Stores on sp.StoreId equals s.Id
        where sp.ProductId == productId
        select new
        {
            storeId = s.Id,
            storeName = s.Name,
            quantity = sp.Quantity
        };

    return Ok(new
    {
        depots = await depots.ToListAsync(),
        stores = await stores.ToListAsync()
    });
}

}
