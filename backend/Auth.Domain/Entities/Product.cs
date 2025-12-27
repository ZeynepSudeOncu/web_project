namespace Auth.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public int Quantity { get; set; }

    public Guid DepotId { get; set; }
    public Depot Depot { get; set; } = default!;
}

