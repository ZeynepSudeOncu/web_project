using Auth.Application.DTOs;
using Auth.Domain.Entities;
using Auth.Infrastructure.Logistics.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DriversController : ControllerBase
{
    private readonly LogisticsDbContext _context;

    public DriversController(LogisticsDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET: api/drivers  (LIST RESPONSE DTO İLE)
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetDrivers()
    {
        var drivers = await _context.Drivers
            .Include(d => d.Truck)
            .AsNoTracking()
            .Select(d => new DriverListResponse
            {
                Id = d.Id,
                FullName = d.FullName,
                Phone = d.Phone,
                License = d.License,
                Status = d.Status,
                TruckId = d.TruckId,
                TruckPlate = d.Truck != null ? d.Truck.Plate : null
            })
            .ToListAsync();

        return Ok(drivers);
    }

    // =====================================================
    // GET: api/drivers/{id}
    // =====================================================
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDriverById(Guid id)
    {
        var driver = await _context.Drivers
            .Include(d => d.Truck)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);

        if (driver == null)
            return NotFound("Sürücü bulunamadı");

        return Ok(driver);
    }

    // =====================================================
    // POST: api/drivers
    // =====================================================
    [HttpPost]
    public async Task<IActionResult> CreateDriver([FromBody] CreateDriverRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.License) ||
            string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest("Zorunlu alanlar boş olamaz");
        }


        var allowedStatuses = new[] { "Müsait", "Yolda" };

    if (!allowedStatuses.Contains(request.Status))
    {
        return BadRequest("Geçersiz sürücü durumu");
    }

        if (request.TruckId.HasValue)
        {
            var truckInUse = await _context.Drivers
                .AnyAsync(d => d.TruckId == request.TruckId);

            if (truckInUse)
                return BadRequest("Bu kamyon başka bir sürücüye atanmış.");
        }

        var driver = new Driver
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            License = request.License.Trim(),
            Status = request.Status.Trim(),
            TruckId = request.TruckId
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();

        return Ok(driver);
    }

    // =====================================================
    // PUT: api/drivers/{id}/assign-truck
    // =====================================================
    [HttpPut("{id:guid}/assign-truck")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AssignTruck(
    Guid id,
    [FromBody] AssignTruckRequest request)
{
    var driver = await _context.Drivers
        .Include(d => d.Truck)
        .FirstOrDefaultAsync(d => d.Id == id);

    if (driver == null)
        return NotFound("Sürücü bulunamadı");

    // 1️⃣ Pasif sürücüye kamyon atanamaz
    if (driver.Status == "Passive")
        return BadRequest("Pasif sürücüye kamyon atanamaz");

    // 2️⃣ Teslimattaki sürücünün kamyonu değiştirilemez
    if (driver.Status == "OnDelivery")
        return BadRequest("Teslimattaki sürücünün kamyonu değiştirilemez");

    // 3️⃣ Kamyon kaldırma (null gönderilirse)
    if (!request.TruckId.HasValue)
    {
        driver.TruckId = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kamyon sürücüden kaldırıldı." });
    }

    // 4️⃣ Kamyon var mı?
    var truckExists = await _context.Trucks
        .AnyAsync(t => t.Id == request.TruckId.Value);

    if (!truckExists)
        return BadRequest("Kamyon bulunamadı");

    // 5️⃣ Kamyon başka sürücüde mi?
    var truckInUse = await _context.Drivers
        .AnyAsync(d =>
            d.TruckId == request.TruckId &&
            d.Id != id);

    if (truckInUse)
        return BadRequest("Bu kamyon başka bir sürücüye atanmış");

    // 6️⃣ Atama
    driver.TruckId = request.TruckId;
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Kamyon sürücüye başarıyla atandı",
        driverId = driver.Id,
        truckId = driver.TruckId
    });
}

    // =====================================================
    // DELETE: api/drivers/{id}
    // =====================================================
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteDriver(Guid id)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == id);
        if (driver == null)
            return NotFound("Sürücü bulunamadı");

        _context.Drivers.Remove(driver);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sürücü silindi." });
    }



    [HttpPut("{id:guid}")]
public async Task<IActionResult> UpdateDriver(Guid id, [FromBody] UpdateDriverRequest request)
{
    var driver = await _context.Drivers.FindAsync(id);

    if (driver == null)
        return NotFound("Sürücü bulunamadı");

    if (string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Phone) ||
        string.IsNullOrWhiteSpace(request.License) ||
        string.IsNullOrWhiteSpace(request.Status))
    {
        return BadRequest("Zorunlu alanlar boş olamaz");
    }

    var allowedStatuses = new[] { "Müsait", "Yolda" };

if (!allowedStatuses.Contains(request.Status))
{
    return BadRequest("Geçersiz sürücü durumu");
}


    driver.FullName = request.FullName.Trim();
    driver.Phone = request.Phone.Trim();
    driver.License = request.License.Trim();
    driver.Status = request.Status.Trim();

    await _context.SaveChangesAsync();

    return NoContent(); // 204
}
}
