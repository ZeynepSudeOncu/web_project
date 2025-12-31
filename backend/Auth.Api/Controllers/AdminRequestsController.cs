using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/admin/requests")]
[Authorize(Roles = "Admin")]
public class AdminRequestsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public AdminRequestsController(LogisticsDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/admin/requests
    // Admin -> TÜM store request'leri görür
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetAllRequests()
    {
        var list =
            from r in _context.StoreRequests.AsNoTracking()
            join s in _context.Stores.AsNoTracking()
                on r.StoreId equals s.Id
            join d in _context.Depots.AsNoTracking()
                on r.DepotId equals d.Id
            join p in _context.Products.AsNoTracking()
                on r.ProductId equals p.Id
            select new
            {
                id = r.Id,

                storeId = s.Id,
                storeName = s.Name,

                depotId = d.Id,
                depotName = d.Name,

                productId = p.Id,
                productName = p.Name,
                productCode = p.Code,

                requestedQuantity = r.RequestedQuantity,
                status = r.Status,

                createdAt = r.CreatedAt,
                pickedUpAt = r.PickedUpAt,
                deliveredAt = r.DeliveredAt
            };

        return Ok(await list
            .OrderByDescending(x => x.createdAt)
            .ToListAsync());
    }
}
