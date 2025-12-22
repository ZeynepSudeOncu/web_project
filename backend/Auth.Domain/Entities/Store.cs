namespace Auth.Domain.Entities;

public class Store
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public bool IsActive { get; set; }

    public Guid DepotId { get; set; }
    
    
}
