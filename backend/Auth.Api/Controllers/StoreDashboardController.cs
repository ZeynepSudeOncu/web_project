using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Auth.Domain.Entities;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/store-dashboard")]
[Authorize(Roles = "Store")]
public class StoreDashboardController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public StoreDashboardController(LogisticsDbContext context)
    {
        _context = context;
    }

    private Guid GetStoreId()
    {
        var storeIdStr =
            User.FindFirstValue("storeId") ??
            User.FindFirstValue("StoreId");

        if (string.IsNullOrWhiteSpace(storeIdStr))
            throw new UnauthorizedAccessException("StoreId claim bulunamadı.");

        return Guid.Parse(storeIdStr);
    }

    // GET: api/store-dashboard
    [HttpGet]
    public async Task<IActionResult> GetMyDashboard()
    {
        var storeId = GetStoreId();

        var baseQ = _context.StoreRequests.Where(r => r.StoreId == storeId);

        var total = await baseQ.CountAsync();
        var pending = await baseQ.CountAsync(r => r.Status == "Pending");
        var approved = await baseQ.CountAsync(r => r.Status == "Approved");
        var delivered = await baseQ.CountAsync(r => r.Status == "Delivered");
        var rejected = await baseQ.CountAsync(r => r.Status == "Rejected");

        var since = DateTime.UtcNow.AddDays(-7);

        var last7DaysOut = await baseQ
            .Where(r => (r.DeliveredAt ?? r.CreatedAt) >= since && r.Status == "Delivered")
            .SumAsync(r => (int?)r.RequestedQuantity) ?? 0;

        var recent = await (
            from r in _context.StoreRequests
            join p in _context.Products on r.ProductId equals p.Id
            where r.StoreId == storeId
            orderby r.CreatedAt descending
            select new
            {
                id = r.Id,
                productId = r.ProductId,
                productName = p.Name,
                productCode = p.Code,
                requestedQuantity = r.RequestedQuantity,
                status = r.Status,
                createdAt = r.CreatedAt,
                deliveredAt = r.DeliveredAt
            }
        ).Take(10).ToListAsync();

        return Ok(new
        {
            cards = new
            {
                total,
                pending,
                approved,
                delivered,
                rejected,
                last7DaysOut
            },
            recent
        });
    }
}
