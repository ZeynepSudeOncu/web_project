using Auth.Application.DTOs.StoreRequests;
using Auth.Domain.Entities;
using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/depot-requests")]
[Authorize(Roles = "Depot")]
public class DepotRequestsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public DepotRequestsController(LogisticsDbContext context)
    {
        _context = context;
    }

    private Guid GetDepotId()
    {
        var depotIdStr =
            User.FindFirstValue("DepotId") ??
            User.FindFirstValue("depotId");

        if (string.IsNullOrWhiteSpace(depotIdStr))
            throw new UnauthorizedAccessException("DepotId claim bulunamadı.");

        return Guid.Parse(depotIdStr);
    }

    // GET: api/depot-requests/my?status=Pending
    [HttpGet("my")]
    public async Task<IActionResult> GetMyDepotRequests([FromQuery] string? status = "Pending")
    {
        var depotId = GetDepotId();

        var q =
            from r in _context.StoreRequests.AsNoTracking()
            join s in _context.Stores.AsNoTracking() on r.StoreId equals s.Id
            join p in _context.Products.AsNoTracking() on r.ProductId equals p.Id
            where r.DepotId == depotId
            select new DepotStoreRequestListItem
            {
                Id = r.Id,
                StoreId = r.StoreId,
                StoreName = s.Name,
                ProductId = r.ProductId,
                ProductName = p.Name,
                ProductCode = p.Code,
                RequestedQuantity = r.RequestedQuantity,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            };

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(x => x.Status == status);

        var list = await q
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    // PATCH: api/depot-requests/{id}/approve
    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var depotId = GetDepotId();

        var req = await _context.StoreRequests.FirstOrDefaultAsync(x => x.Id == id && x.DepotId == depotId);
        if (req == null) return NotFound("Talep bulunamadı.");
        if (req.Status != "Pending") return BadRequest("Talep zaten işlenmiş.");

        // depot stok kontrol
        var depotProduct = await _context.DepotProducts
            .FirstOrDefaultAsync(x => x.DepotId == depotId && x.ProductId == req.ProductId);

        if (depotProduct == null)
            return BadRequest("Depoda bu ürün yok.");

        if (depotProduct.Quantity < req.RequestedQuantity)
            return BadRequest("Depo stok yetersiz.");

        // store stok kaydı (StoreProduct tablon: StoreProduct)
        var storeProduct = await _context.StoreProduct
            .FirstOrDefaultAsync(x => x.StoreId == req.StoreId && x.ProductId == req.ProductId);

        if (storeProduct == null)
        {
            storeProduct = new StoreProduct
            {
                Id = Guid.NewGuid(),
                StoreId = req.StoreId,
                ProductId = req.ProductId,
                Quantity = 0
            };
            _context.StoreProduct.Add(storeProduct);
        }

        // stok aktar
        depotProduct.Quantity -= req.RequestedQuantity;
        storeProduct.Quantity += req.RequestedQuantity;

        req.Status = "Approved";

        await _context.SaveChangesAsync();
        return Ok(new { message = "Talep onaylandı ve stok aktarıldı." });
    }

    // PATCH: api/depot-requests/{id}/reject
    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var depotId = GetDepotId();

        var req = await _context.StoreRequests.FirstOrDefaultAsync(x => x.Id == id && x.DepotId == depotId);
        if (req == null) return NotFound("Talep bulunamadı.");
        if (req.Status != "Pending") return BadRequest("Talep zaten işlenmiş.");

        req.Status = "Rejected";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Talep reddedildi." });
    }
}
