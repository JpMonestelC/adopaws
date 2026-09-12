using Adopaws.Domain.Entities;

namespace Adopaws.Application.Interfaces;

public interface IPetPhotoRepository
{
    Task<IEnumerable<PetPhoto>> GetByPetIdAsync(int petId);
    Task<PetPhoto?> GetByIdAsync(int id);
    Task<PetPhoto> CreateAsync(PetPhoto petPhoto);
    Task DeleteAsync(int id);
}

public interface IAdoptionRequestRepository
{
    Task<AdoptionRequest?> GetByIdAsync(int id);
    Task<IEnumerable<AdoptionRequest>> GetByPetIdAsync(int petId);
    Task<IEnumerable<AdoptionRequest>> GetByUserIdAsync(int userId);
    Task<bool> ExistsAsync(int petId, int userId);
    Task<AdoptionRequest> CreateAsync(AdoptionRequest request);
    Task<AdoptionRequest> UpdateAsync(AdoptionRequest request);
    Task DeleteAsync(int id);
}

public interface IMarketplaceItemRepository
{
    Task<IEnumerable<MarketplaceItem>> GetAllAsync();
    Task<MarketplaceItem?> GetByIdAsync(int id);
    Task<IEnumerable<MarketplaceItem>> GetByUserIdAsync(int userId);
    Task<MarketplaceItem> CreateAsync(MarketplaceItem item);
    Task<MarketplaceItem> UpdateAsync(MarketplaceItem item);
    Task DeleteAsync(int id);
}

public interface IConsultationRepository
{
    Task<Consultation?> GetByIdAsync(int id);
    Task<IEnumerable<Consultation>> GetBySenderIdAsync(int senderUserId);
    Task<IEnumerable<Consultation>> GetByReceiverIdAsync(int receiverUserId);
    Task<Consultation> CreateAsync(Consultation consultation);
    Task<Consultation> UpdateAsync(Consultation consultation);
}

public interface IConsultationResponseRepository
{
    Task<IEnumerable<ConsultationResponse>> GetByConsultationIdAsync(int consultationId);
    Task<ConsultationResponse?> GetByIdAsync(int id);
    Task<ConsultationResponse> CreateAsync(ConsultationResponse response);
}
