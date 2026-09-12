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
    public int IdPet { get; set; }
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
    public int IdPet { get; set; }
    public int IdUser { get; set; }
    public string? Address { get; set; }
    public string? HousingType { get; set; }
    public string? PetExperience { get; set; }
    public bool HasOtherPets { get; set; }
    public string? ContactPhone { get; set; }
    public string? AdoptionReason { get; set; }
}

public class UpdateAdoptionRequestStatusDto
{
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
    public int IdUser { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemCondition { get; set; }
    public decimal Price { get; set; }
    public string? Region { get; set; }
    public string? MainPhoto { get; set; }
}

public class UpdateMarketplaceItemDto
{
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemCondition { get; set; }
    public decimal Price { get; set; }
    public string? Region { get; set; }
    public string? MainPhoto { get; set; }
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
    public int SenderIdUser { get; set; }
    public int ReceiverIdUser { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class UpdateConsultationStatusDto
{
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
    public int IdConsultation { get; set; }
    public int IdUser { get; set; }
    public string ResponseMessage { get; set; } = string.Empty;
}
