namespace Adopaws.Domain.Entities;

public class User
{
    public int IdUser { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Region { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
    public bool IsVerified { get; set; }
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Active";

    // Navigation Properties
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
    public ICollection<MarketplaceItem> MarketplaceItems { get; set; } = new List<MarketplaceItem>();
    public ICollection<Consultation> SentConsultations { get; set; } = new List<Consultation>();
    public ICollection<Consultation> ReceivedConsultations { get; set; } = new List<Consultation>();
    public ICollection<ConsultationResponse> ConsultationResponses { get; set; } = new List<ConsultationResponse>();
}
