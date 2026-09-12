namespace Adopaws.Domain.Entities;

public class Pet
{
    public int IdPet { get; set; }
    public int IdUser { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PetType { get; set; } = string.Empty;
    public string? Breed { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public string? Size { get; set; }
    public bool Vaccinated { get; set; }
    public bool Sterilized { get; set; }
    public string? Description { get; set; }
    public string? Region { get; set; }
    public string PublicationStatus { get; set; } = "Available";
    public DateTime PublishedDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User User { get; set; } = null!;
    public ICollection<PetPhoto> PetPhotos { get; set; } = new List<PetPhoto>();
    public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
}
