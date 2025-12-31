using Auth.Application.DTOs;
using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/truck-loads")]
[Authorize(Roles = "Depot,Admin")]
public class TruckLoadsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public TruckLoadsController(LogisticsDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/truck-loads
    // Kamyon doluluk özetleri
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetTruckLoads()
    {
        var trucks = await _context.Trucks
            .AsNoTracking()
            .ToListAsync();

        var result = new List<TruckLoadDto>();

        foreach (var truck in trucks)
        {
            var used = await _context.StoreRequests
                .AsNoTracking()
                .Where(r =>
                    r.TruckId == truck.Id &&
                    (
                        r.Status == "Approved" ||
                        r.Status == "OnTheWay" ||
                        r.Status == "InTransit"
                    )
                )
                .SumAsync(r => r.RequestedQuantity);

            result.Add(new TruckLoadDto
            {
                TruckId = truck.Id,
                Plate = truck.Plate,
                Capacity = truck.Capacity,
                Used = used
            });
        }

        return Ok(result);
    }

    // =====================================================
    // GET: api/truck-loads/{truckId}/items
    // Kamyon içindeki ürünler (ürün bazlı toplam)
    // =====================================================
    [HttpGet("{truckId:guid}/items")]
    public async Task<IActionResult> GetTruckItems(Guid truckId)
    {
        var items = await (
            from r in _context.StoreRequests.AsNoTracking()
            join p in _context.Products.AsNoTracking()
                on r.ProductId equals p.Id
            where
                r.TruckId == truckId &&
                (
                    r.Status == "Approved" ||
                    r.Status == "OnTheWay" ||
                    r.Status == "InTransit"
                )
            group new { r, p } by new
            {
                r.ProductId,
                p.Name,
                p.Code
            }
            into g
            select new
            {
                productId = g.Key.ProductId,
                productName = g.Key.Name,
                productCode = g.Key.Code,
                quantity = g.Sum(x => x.r.RequestedQuantity)
            }
        ).ToListAsync();

        return Ok(items);
    }
}
