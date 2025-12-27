using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Auth.Infrastructure.Logistics.Context;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/admin/depots")]
[Authorize(Roles = "Admin")]
public class AdminDepotProductsController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public AdminDepotProductsController(LogisticsDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/depots/products
    [HttpGet("products")]
    public async Task<IActionResult> GetAllDepotProducts()
    {
        var data = await _context.Products
            .Include(p => p.Depot)
            .Select(p => new
            {
                DepotId = p.Depot.Id,
                DepotName = p.Depot.Name,
                ProductId = p.Id,
                ProductName = p.Name,
                ProductCode = p.Code,
                Quantity = p.Quantity
            })
            .ToListAsync();

        return Ok(data);
    }
}
