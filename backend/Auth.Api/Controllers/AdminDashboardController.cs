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
}
