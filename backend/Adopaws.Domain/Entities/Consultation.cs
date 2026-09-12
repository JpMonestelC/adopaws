namespace Adopaws.Domain.Entities;

public class Consultation
{
    public int IdConsultation { get; set; }
    public int SenderIdUser { get; set; }
    public int ReceiverIdUser { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string ConsultationStatus { get; set; } = "Open";
    public DateTime SentDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
    public ICollection<ConsultationResponse> Responses { get; set; } = new List<ConsultationResponse>();
}
