using Adopaws.Application.DTOs;
using Adopaws.Domain.Entities;

namespace Adopaws.Application.Mappings;

public static class UserMapper
{
    public static UserDto ToDto(User user) => new()
    {
        IdUser = user.IdUser,
        FullName = user.FullName,
        Email = user.Email,
        Phone = user.Phone,
        Region = user.Region,
        UserType = user.UserType,
        ProfileDescription = user.ProfileDescription,
        ProfileImage = user.ProfileImage,
        IsVerified = user.IsVerified,
        RegistrationDate = user.RegistrationDate,
        Status = user.Status
    };
}

public static class PetMapper
{
    public static PetDto ToDto(Pet pet) => new()
    {
        IdPet = pet.IdPet,
        IdUser = pet.IdUser,
        Name = pet.Name,
        PetType = pet.PetType,
        Breed = pet.Breed,
        Age = pet.Age,
        Gender = pet.Gender,
        Size = pet.Size,
        Vaccinated = pet.Vaccinated,
        Sterilized = pet.Sterilized,
        Description = pet.Description,
        Region = pet.Region,
        PublicationStatus = pet.PublicationStatus,
        PublishedDate = pet.PublishedDate
    };
}

public static class AdoptionRequestMapper
{
    public static AdoptionRequestDto ToDto(AdoptionRequest r) => new()
    {
        IdAdoptionRequest = r.IdAdoptionRequest,
        IdPet = r.IdPet,
        IdUser = r.IdUser,
        Address = r.Address,
        HousingType = r.HousingType,
        PetExperience = r.PetExperience,
        HasOtherPets = r.HasOtherPets,
        ContactPhone = r.ContactPhone,
        AdoptionReason = r.AdoptionReason,
        RequestStatus = r.RequestStatus,
        RequestDate = r.RequestDate
    };
}

public static class MarketplaceItemMapper
{
    public static MarketplaceItemDto ToDto(MarketplaceItem item) => new()
    {
        IdMarketplaceItem = item.IdMarketplaceItem,
        IdUser = item.IdUser,
        Title = item.Title,
        Category = item.Category,
        Description = item.Description,
        ItemCondition = item.ItemCondition,
        Price = item.Price,
        Region = item.Region,
        MainPhoto = item.MainPhoto,
        PublishedDate = item.PublishedDate,
        PublicationStatus = item.PublicationStatus
    };
}

public static class ConsultationMapper
{
    public static ConsultationDto ToDto(Consultation c) => new()
    {
        IdConsultation = c.IdConsultation,
        SenderIdUser = c.SenderIdUser,
        ReceiverIdUser = c.ReceiverIdUser,
        Subject = c.Subject,
        Message = c.Message,
        ConsultationStatus = c.ConsultationStatus,
        SentDate = c.SentDate
    };
}
