namespace Adopaws.Domain.Entities;

public class PetPhoto
{
    public int IdPetPhoto { get; set; }
    public int IdPet { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }

    // Navigation Property
    public Pet Pet { get; set; } = null!;
}
