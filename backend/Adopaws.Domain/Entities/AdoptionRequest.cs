namespace Adopaws.Domain.Entities;

public class AdoptionRequest
{
    public int IdAdoptionRequest { get; set; }
    public int IdPet { get; set; }
    public int IdUser { get; set; }
    public string? Address { get; set; }
    public string? HousingType { get; set; }
    public string? PetExperience { get; set; }
    public bool HasOtherPets { get; set; }
    public string? ContactPhone { get; set; }
    public string? AdoptionReason { get; set; }
    public string RequestStatus { get; set; } = "Pending";
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Pet Pet { get; set; } = null!;
    public User User { get; set; } = null!;
}
