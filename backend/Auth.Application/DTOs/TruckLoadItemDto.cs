namespace Auth.Application.DTOs.TruckLoads;

public class TruckLoadItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductCode { get; set; } = "";
    public int Quantity { get; set; }
}
