using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Auth.Infrastructure.Logistics.Context;
using Auth.Domain.Entities;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public StoresController(LogisticsDbContext context)
    {
        _context = context;
    }

    // GET: api/stores
    [HttpGet]
    public async Task<IActionResult> GetStores()
    {
        var stores = await _context.Stores.ToListAsync();
        return Ok(stores);
    }

    // GET: api/stores/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetStoreById(string id)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(x => x.Id == id);

        if (store == null)
            return NotFound("Mağaza bulunamadı");

        return Ok(store);
    }

    // GET: api/stores/by-depot/{depotId}
    [HttpGet("by-depot/{depotId}")]
    public async Task<IActionResult> GetStoresByDepot(Guid depotId)
    {
        var stores = await _context.Stores
            .Where(s => s.DepotId == depotId)
            .ToListAsync();

        return Ok(stores);
    }

    // POST: api/stores
    [HttpPost]
    public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
    {
        var depotExists = await _context.Depots.AnyAsync(d => d.Id == request.DepotId);
        if (!depotExists)
            return BadRequest("Geçersiz depo seçildi");

        var store = new Store
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Address = request.Address,
            Phone = request.Phone,
            IsActive = request.IsActive,
            DepotId = request.DepotId
        };

        _context.Stores.Add(store);
        await _context.SaveChangesAsync();

        return Ok(store);
    }

    // PUT: api/stores/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStore(string id, [FromBody] UpdateStoreRequest request)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(x => x.Id == id);

        if (store == null)
            return NotFound("Mağaza bulunamadı");

        var depotExists = await _context.Depots.AnyAsync(d => d.Id == request.DepotId);
        if (!depotExists)
            return BadRequest("Geçersiz depo seçildi");

        store.Name = request.Name;
        store.Address = request.Address;
        store.Phone = request.Phone;
        store.IsActive = request.IsActive;
        store.DepotId = request.DepotId;

        await _context.SaveChangesAsync();

        return Ok(store);
    }

    // DELETE: api/stores/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStore(string id)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(x => x.Id == id);

        if (store == null)
            return NotFound("Mağaza bulunamadı");

        _context.Stores.Remove(store);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

// ✅ Request modellerini aynı dosyaya ekledik (derleme hatası çözülür)
public class CreateStoreRequest
{
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public bool IsActive { get; set; }
    public Guid DepotId { get; set; }
}

public class UpdateStoreRequest
{
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public bool IsActive { get; set; }
    public Guid DepotId { get; set; }
}
