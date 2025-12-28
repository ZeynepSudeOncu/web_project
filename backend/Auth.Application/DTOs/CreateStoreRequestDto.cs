using System;

namespace Auth.Application.DTOs.StoreRequests;

public class CreateStoreRequestDto
{
    public Guid ProductId { get; set; }
    public int RequestedQuantity { get; set; }
}
