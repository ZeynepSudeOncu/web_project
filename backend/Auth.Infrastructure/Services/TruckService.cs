using Auth.Application.DTOs;
using Auth.Application.Services;
using Auth.Domain.Entities;                      // 🔥 BU EKSİKTİ
using Auth.Infrastructure.Logistics.Context;
using Microsoft.EntityFrameworkCore;

namespace Auth.Infrastructure.Services;

public class TruckService : ITruckService
{
    private readonly LogisticsDbContext _context;

    public TruckService(LogisticsDbContext context)
    {
        _context = context;
    }

    // ✅ Kamyonlar + atanmış mı bilgisi
    public async Task<List<TruckListResponse>> GetAllTrucksAsync()
    {
        var trucks = await _context.Trucks
            .Where(t => t.IsActive)
            .Select(t => new TruckListResponse
{
    Id = t.Id,
    Plate = t.Plate,
    Model = t.Model,
    Capacity = t.Capacity,
    IsAssigned = _context.Drivers.Any(d => d.TruckId == t.Id)
})

            .ToListAsync();

        return trucks;
    }

    public async Task<CreateTruckDto> CreateTruckAsync(CreateTruckDto dto)
    {
        var truck = new Truck
        {
            Id = Guid.NewGuid(),
            Plate = dto.Plate,
            Model = dto.Model,
            Capacity = dto.Capacity,
            IsActive = true
        };

        _context.Trucks.Add(truck);
        await _context.SaveChangesAsync();

        return dto;
    }

    public async Task<bool> UpdateTruckAsync(Guid id, UpdateTruckDto dto)
    {
        var truck = await _context.Trucks.FindAsync(id);
        if (truck == null)
            return false;

        truck.Plate = dto.Plate;
        truck.Model = dto.Model;
        truck.Capacity = dto.Capacity;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateTruckAsync(Guid id)
    {
        var truck = await _context.Trucks.FindAsync(id);
        if (truck == null)
            return false;

        truck.IsActive = false;   // ❗ silmek yerine pasif yapıyoruz
        await _context.SaveChangesAsync();

        return true;
    }
}
