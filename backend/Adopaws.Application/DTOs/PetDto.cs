using System.ComponentModel.DataAnnotations;

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
    // Ignorado por PetsController.Create: el dueño real se toma del JWT
    // del llamante, nunca de este campo, para evitar que alguien publique
    // una mascota a nombre de otro usuario.
    public int IdUser { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de mascota es obligatorio.")]
    [StringLength(50)]
    public string PetType { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Breed { get; set; }

    [Range(0, 40, ErrorMessage = "La edad debe estar entre 0 y 40 años.")]
    public int? Age { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(30)]
    public string? Size { get; set; }

    public bool Vaccinated { get; set; }
    public bool Sterilized { get; set; }
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }
}

public class UpdatePetDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Breed { get; set; }

    [Range(0, 40, ErrorMessage = "La edad debe estar entre 0 y 40 años.")]
    public int? Age { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(30)]
    public string? Size { get; set; }

    public bool Vaccinated { get; set; }
    public bool Sterilized { get; set; }
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }

    [Required]
    [StringLength(50)]
    public string PublicationStatus { get; set; } = string.Empty;
}
