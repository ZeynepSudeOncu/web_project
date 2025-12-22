namespace Auth.Application.DTOs;

public class CreateStoreDto
{
    public string Name { get; set; } = null!;

    public string Address { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public Guid DepotId { get; set; }
}