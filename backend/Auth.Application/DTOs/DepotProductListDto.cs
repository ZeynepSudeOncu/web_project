namespace Auth.Application.DTOs;

public class DepotProductListDto
{
    public Guid DepotId { get; set; }
    public string DepotName { get; set; } = default!;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string ProductCode { get; set; } = default!;
    public int Quantity { get; set; }
}
