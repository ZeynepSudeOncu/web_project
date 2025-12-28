using Auth.Application.DTOs.StoreRequests;
using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Auth.Domain.Entities;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/store-requests")]
[Authorize(Roles = "Store")]
public class StoreRequestsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public StoreRequestsController(LogisticsDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest(
        [FromBody] CreateStoreRequestDto dto)
    {
        // 1️⃣ StoreId JWT'den
        var storeIdStr =
            User.FindFirstValue("StoreId") ??
            User.FindFirstValue("storeId");

        if (string.IsNullOrEmpty(storeIdStr))
            return Unauthorized("StoreId claim bulunamadı.");

        var storeId = Guid.Parse(storeIdStr);

        // 2️⃣ Store → bağlı olduğu Depot
        var store = await _context.Stores
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == storeId);

        if (store == null)
            return BadRequest("Store bulunamadı.");

        // 3️⃣ Ürün var mı?
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == dto.ProductId);

        if (!productExists)
            return BadRequest("Ürün bulunamadı.");

        // 4️⃣ Talep oluştur
        var request = new StoreRequest
        {
            Id = Guid.NewGuid(),
            StoreId = storeId,
            DepotId = store.DepotId,
            ProductId = dto.ProductId,
            RequestedQuantity = dto.RequestedQuantity,
            Status = "Pending"
        };

        _context.StoreRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Talep başarıyla oluşturuldu." });
    }
}
