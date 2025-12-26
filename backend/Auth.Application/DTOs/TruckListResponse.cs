namespace Auth.Application.DTOs;
public class TruckListResponse
{
    public Guid Id { get; set; }
    public string Plate { get; set; }
    public string Model { get; set; }
    public int Capacity { get; set; }
    public bool IsAssigned { get; set; }
}
