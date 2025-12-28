using System;

namespace Auth.Application.DTOs.StoreRequests;

public class DepotStoreRequestListItem
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = default!;

    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string ProductCode { get; set; } = default!;

    public int RequestedQuantity { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
