using System;

namespace Auth.Domain.Entities;

public class StoreRequest
{
    public Guid Id { get; set; }

    public Guid StoreId { get; set; }
    public Guid DepotId { get; set; }
    public Guid ProductId { get; set; }

    public int RequestedQuantity { get; set; }

    public string Status { get; set; } = "Pending"; // Pending / Approved / Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
