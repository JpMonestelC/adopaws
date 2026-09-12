using Adopaws.Application.DTOs;

namespace Adopaws.Application.Interfaces;

public interface IPetService
{
    Task<IEnumerable<PetDto>> GetAllAsync();
    Task<PetDto?> GetByIdAsync(int id);
    Task<PetDto> CreateAsync(CreatePetDto dto);
    Task<PetDto?> UpdateAsync(int id, UpdatePetDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IPetPhotoService
{
    Task<IEnumerable<PetPhotoDto>> GetByPetIdAsync(int petId);
    Task<PetPhotoDto> CreateAsync(CreatePetPhotoDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IAdoptionRequestService
{
    Task<AdoptionRequestDto?> GetByIdAsync(int id);
    Task<IEnumerable<AdoptionRequestDto>> GetByPetIdAsync(int petId);
    Task<IEnumerable<AdoptionRequestDto>> GetByUserIdAsync(int userId);
    Task<AdoptionRequestDto> CreateAsync(CreateAdoptionRequestDto dto);
    Task<AdoptionRequestDto?> UpdateStatusAsync(int id, UpdateAdoptionRequestStatusDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IMarketplaceItemService
{
    Task<IEnumerable<MarketplaceItemDto>> GetAllAsync();
    Task<MarketplaceItemDto?> GetByIdAsync(int id);
    Task<MarketplaceItemDto> CreateAsync(CreateMarketplaceItemDto dto);
    Task<MarketplaceItemDto?> UpdateAsync(int id, UpdateMarketplaceItemDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IConsultationService
{
    Task<ConsultationDto?> GetByIdAsync(int id);
    Task<IEnumerable<ConsultationDto>> GetBySenderIdAsync(int senderUserId);
    Task<IEnumerable<ConsultationDto>> GetByReceiverIdAsync(int receiverUserId);
    Task<ConsultationDto> CreateAsync(CreateConsultationDto dto);
    Task<ConsultationDto?> UpdateStatusAsync(int id, UpdateConsultationStatusDto dto);
}

public interface IConsultationResponseService
{
    Task<IEnumerable<ConsultationResponseDto>> GetByConsultationIdAsync(int consultationId);
    Task<ConsultationResponseDto> CreateAsync(CreateConsultationResponseDto dto);
}
