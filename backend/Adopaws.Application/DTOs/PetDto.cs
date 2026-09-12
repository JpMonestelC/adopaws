namespace Adopaws.Application.DTOs;

public class PetDto
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
    public string PublicationStatus { get; set; } = string.Empty;
    public DateTime PublishedDate { get; set; }
}

public class CreatePetDto
{
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
}

public class UpdatePetDto
{
    public string Name { get; set; } = string.Empty;
    public string? Breed { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public string? Size { get; set; }
    public bool Vaccinated { get; set; }
    public bool Sterilized { get; set; }
    public string? Description { get; set; }
    public string? Region { get; set; }
    public string PublicationStatus { get; set; } = string.Empty;
}
