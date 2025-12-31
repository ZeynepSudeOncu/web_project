namespace Auth.Application.DTOs;

public class TruckLoadDto
{
    public Guid TruckId { get; set; }
    public string Plate { get; set; } = null!;

    public int Capacity { get; set; }
    public int Used { get; set; }

    public int Remaining => Capacity - Used;

    public int Percent =>
        Capacity == 0
            ? 0
            : (int)Math.Round((double)Used / Capacity * 100);
}
