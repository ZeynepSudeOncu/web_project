namespace Auth.Application.DTOs.StoreRequests;

public class UpdateStoreRequestStatusDto
{
    public string Status { get; set; } = default!; // Approved / Rejected
}
