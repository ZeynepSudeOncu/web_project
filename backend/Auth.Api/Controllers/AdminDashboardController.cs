using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public AdminDashboardController(LogisticsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // ---------- ÜRÜN & STOK ----------
        var totalProducts = await _context.Products.CountAsync();

        var totalDepotStock = await _context.DepotProducts.SumAsync(x => (int?)x.Quantity) ?? 0;
        var totalStoreStock = await _context.StoreProduct.SumAsync(x => (int?)x.Quantity) ?? 0;

        var totalStock = totalDepotStock + totalStoreStock;

        // ---------- TALEPLER ----------
        var pendingRequests = await _context.StoreRequests.CountAsync(x => x.Status == "Pending");
        var onTheWayRequests = await _context.StoreRequests.CountAsync(x =>
            x.Status == "OnTheWay" || x.Status == "InTransit");
        var deliveredRequests = await _context.StoreRequests.CountAsync(x => x.Status == "Delivered");

        // ---------- GÜNLÜK TALEP GRAFİĞİ (SON 7 GÜN) ----------
        var last7Days = DateTime.UtcNow.Date.AddDays(-6);

        var dailyRequests = await _context.StoreRequests
            .Where(x => x.CreatedAt >= last7Days)
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key,
                count = g.Count()
            })
            .OrderBy(x => x.date)
            .ToListAsync();

        return Ok(new
        {
            cards = new
            {
                totalProducts,
                totalStock,
                pendingRequests,
                onTheWayRequests,
                deliveredRequests
            },
            charts = new
            {
                dailyRequests,
                statusDistribution = new
                {
                    pending = pendingRequests,
                    onTheWay = onTheWayRequests,
                    delivered = deliveredRequests
                }
            }
        });
    }

    [HttpGet("critical-stocks")]
    public async Task<IActionResult> GetCriticalStocks([FromQuery] int threshold = 5)
    {
        var depotStocks =
            from dp in _context.DepotProducts
            group dp by dp.ProductId into g
            select new
            {
                ProductId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            };

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
            let total =
                (ds != null ? ds.Quantity : 0) +
                (ss != null ? ss.Quantity : 0)
            where total < threshold
            select new
            {
                productId = p.Id,
                productName = p.Name,
                productCode = p.Code,
                totalQuantity = total
            };

        var list = await merged
            .OrderBy(x => x.totalQuantity)
            .ToListAsync();

        return Ok(new
        {
            count = list.Count,
            items = list
        });
    }

[HttpGet("product-demand")]
public async Task<IActionResult> GetProductDemand([FromQuery] int days = 7)
{
    var fromDate = DateTime.UtcNow.Date.AddDays(-days);

    // En çok talep edilenler
    var topProducts = await _context.StoreRequests
        .Where(r => r.CreatedAt >= fromDate)
        .GroupBy(r => r.ProductId)
        .Select(g => new
        {
            ProductId = g.Key,
            RequestCount = g.Count()
        })
        .OrderByDescending(x => x.RequestCount)
        .Take(5)
        .Join(
            _context.Products,
            g => g.ProductId,
            p => p.Id,
            (g, p) => new
            {
                productId = p.Id,
                productName = p.Name,
                productCode = p.Code,
                requestCount = g.RequestCount
            }
        )
        .ToListAsync();

    // Hiç talep almayanlar
    var requestedProductIds = await _context.StoreRequests
        .Select(r => r.ProductId)
        .Distinct()
        .ToListAsync();

    var neverRequested = await _context.Products
        .Where(p => !requestedProductIds.Contains(p.Id))
        .Select(p => new
        {
            productId = p.Id,
            productName = p.Name,
            productCode = p.Code
        })
        .ToListAsync();

    return Ok(new
    {
        topProducts,
        neverRequested
    });
}


}
