using System.ComponentModel.DataAnnotations;

namespace Adopaws.Application.DTOs;

// PetPhoto DTOs
public class PetPhotoDto
{
    public int IdPetPhoto { get; set; }
    public int IdPet { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }
}

public class CreatePetPhotoDto
{
    [Range(1, int.MaxValue, ErrorMessage = "IdPet debe ser un id de mascota válido.")]
    public int IdPet { get; set; }

    [Required(ErrorMessage = "La URL de la foto es obligatoria.")]
    [StringLength(500)]
    public string PhotoUrl { get; set; } = string.Empty;

    public bool IsMain { get; set; }
}

// AdoptionRequest DTOs
public class AdoptionRequestDto
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
    public string RequestStatus { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
}

public class CreateAdoptionRequestDto
{
    [Range(1, int.MaxValue, ErrorMessage = "IdPet debe ser un id de mascota válido.")]
    public int IdPet { get; set; }

    // Ignorado por AdoptionRequestsController.Create: el solicitante real
    // se toma del JWT del llamante, nunca de este campo.
    public int IdUser { get; set; }

    public string? Address { get; set; }

    [StringLength(100)]
    public string? HousingType { get; set; }

    public string? PetExperience { get; set; }
    public bool HasOtherPets { get; set; }

    [StringLength(30)]
    public string? ContactPhone { get; set; }

    public string? AdoptionReason { get; set; }
}

public class UpdateAdoptionRequestStatusDto
{
    [Required(ErrorMessage = "El estado de la solicitud es obligatorio.")]
    [StringLength(50)]
    public string RequestStatus { get; set; } = string.Empty;
}

// MarketplaceItem DTOs
public class MarketplaceItemDto
{
    public int IdMarketplaceItem { get; set; }
    public int IdUser { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemCondition { get; set; }
    public decimal Price { get; set; }
    public string? Region { get; set; }
    public string? MainPhoto { get; set; }
    public DateTime PublishedDate { get; set; }
    public string PublicationStatus { get; set; } = string.Empty;
}

public class CreateMarketplaceItemDto
{
    // Ignorado por MarketplaceItemsController.Create: el dueño real se toma
    // del JWT del llamante, nunca de este campo.
    public int IdUser { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Category { get; set; }

    public string? Description { get; set; }

    [StringLength(50)]
    public string? ItemCondition { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "El precio debe ser un valor positivo.")]
    public decimal Price { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }

    [StringLength(500)]
    public string? MainPhoto { get; set; }
}

public class UpdateMarketplaceItemDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Category { get; set; }

    public string? Description { get; set; }

    [StringLength(50)]
    public string? ItemCondition { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "El precio debe ser un valor positivo.")]
    public decimal Price { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }

    [StringLength(500)]
    public string? MainPhoto { get; set; }

    [Required]
    [StringLength(50)]
    public string PublicationStatus { get; set; } = string.Empty;
}

// Consultation DTOs
public class ConsultationDto
{
    public int IdConsultation { get; set; }
    public int SenderIdUser { get; set; }
    public int ReceiverIdUser { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string ConsultationStatus { get; set; } = string.Empty;
    public DateTime SentDate { get; set; }
}

public class CreateConsultationDto
{
    // Ignorado por ConsultationsController.Create: el remitente real se
    // toma del JWT del llamante, nunca de este campo.
    public int SenderIdUser { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ReceiverIdUser debe ser un id de usuario válido.")]
    public int ReceiverIdUser { get; set; }

    [Required(ErrorMessage = "El asunto es obligatorio.")]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "El mensaje es obligatorio.")]
    public string Message { get; set; } = string.Empty;
}

public class UpdateConsultationStatusDto
{
    [Required(ErrorMessage = "El estado de la consulta es obligatorio.")]
    [StringLength(50)]
    public string ConsultationStatus { get; set; } = string.Empty;
}

// ConsultationResponse DTOs
public class ConsultationResponseDto
{
    public int IdConsultationResponse { get; set; }
    public int IdConsultation { get; set; }
    public int IdUser { get; set; }
    public string ResponseMessage { get; set; } = string.Empty;
    public DateTime ResponseDate { get; set; }
}

public class CreateConsultationResponseDto
{
    [Range(1, int.MaxValue, ErrorMessage = "IdConsultation debe ser un id de consulta válido.")]
    public int IdConsultation { get; set; }

    // Ignorado por ConsultationResponsesController.Create: el autor real se
    // toma del JWT del llamante, nunca de este campo.
    public int IdUser { get; set; }

    [Required(ErrorMessage = "El mensaje de respuesta es obligatorio.")]
    public string ResponseMessage { get; set; } = string.Empty;
}
