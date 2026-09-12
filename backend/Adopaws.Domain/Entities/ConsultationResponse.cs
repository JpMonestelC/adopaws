namespace Adopaws.Domain.Entities;

public class ConsultationResponse
{
    public int IdConsultationResponse { get; set; }
    public int IdConsultation { get; set; }
    public int IdUser { get; set; }
    public string ResponseMessage { get; set; } = string.Empty;
    public DateTime ResponseDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Consultation Consultation { get; set; } = null!;
    public User User { get; set; } = null!;
}
