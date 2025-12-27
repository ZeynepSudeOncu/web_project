using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Auth.Infrastructure.Logistics.Context;

namespace Auth.Api.Controllers;

[Authorize(Roles = "Depot")]
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public ProductsController(LogisticsDbContext context)
    {
        _context = context;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyProducts()
    {
        var depotIdStr = User.FindFirst("DepotId")?.Value;

        if (string.IsNullOrEmpty(depotIdStr))
            return Unauthorized("Depot bilgisi token içinde yok.");

        var DepotId = Guid.Parse(depotIdStr);

        var products = await _context.Products
            .Where(p => p.DepotId == DepotId)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Code,
                p.Quantity
            })
            .ToListAsync();

        return Ok(products);
    }
}
