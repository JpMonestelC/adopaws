using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Adopaws.Application.Mappings;
using Adopaws.Domain.Entities;

namespace Adopaws.Application.Services;

public class PetPhotoService : IPetPhotoService
{
    private readonly IPetPhotoRepository _repo;
    public PetPhotoService(IPetPhotoRepository repo) => _repo = repo;

    public async Task<IEnumerable<PetPhotoDto>> GetByPetIdAsync(int petId)
    {
        var photos = await _repo.GetByPetIdAsync(petId);
        return photos.Select(p => new PetPhotoDto
        {
            IdPetPhoto = p.IdPetPhoto,
            IdPet = p.IdPet,
            PhotoUrl = p.PhotoUrl,
            IsMain = p.IsMain
        });
    }

    public async Task<PetPhotoDto> CreateAsync(CreatePetPhotoDto dto)
    {
        var photo = new PetPhoto
        {
            IdPet = dto.IdPet,
            PhotoUrl = dto.PhotoUrl,
            IsMain = dto.IsMain
        };
        var created = await _repo.CreateAsync(photo);
        return new PetPhotoDto
        {
            IdPetPhoto = created.IdPetPhoto,
            IdPet = created.IdPet,
            PhotoUrl = created.PhotoUrl,
            IsMain = created.IsMain
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var photo = await _repo.GetByIdAsync(id);
        if (photo is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}

public class AdoptionRequestService : IAdoptionRequestService
{
    private readonly IAdoptionRequestRepository _repo;
    public AdoptionRequestService(IAdoptionRequestRepository repo) => _repo = repo;

    public async Task<AdoptionRequestDto?> GetByIdAsync(int id)
    {
        var r = await _repo.GetByIdAsync(id);
        return r is null ? null : AdoptionRequestMapper.ToDto(r);
    }

    public async Task<IEnumerable<AdoptionRequestDto>> GetByPetIdAsync(int petId)
    {
        var requests = await _repo.GetByPetIdAsync(petId);
        return requests.Select(AdoptionRequestMapper.ToDto);
    }

    public async Task<IEnumerable<AdoptionRequestDto>> GetByUserIdAsync(int userId)
    {
        var requests = await _repo.GetByUserIdAsync(userId);
        return requests.Select(AdoptionRequestMapper.ToDto);
    }

    public async Task<AdoptionRequestDto> CreateAsync(CreateAdoptionRequestDto dto)
    {
        if (await _repo.ExistsAsync(dto.IdPet, dto.IdUser))
            throw new InvalidOperationException("A request for this pet already exists from this user.");

        var request = new AdoptionRequest
        {
            IdPet = dto.IdPet,
            IdUser = dto.IdUser,
            Address = dto.Address,
            HousingType = dto.HousingType,
            PetExperience = dto.PetExperience,
            HasOtherPets = dto.HasOtherPets,
            ContactPhone = dto.ContactPhone,
            AdoptionReason = dto.AdoptionReason,
            RequestStatus = "Pending",
            RequestDate = DateTime.UtcNow
        };
        var created = await _repo.CreateAsync(request);
        return AdoptionRequestMapper.ToDto(created);
    }

    public async Task<AdoptionRequestDto?> UpdateStatusAsync(int id, UpdateAdoptionRequestStatusDto dto)
    {
        var request = await _repo.GetByIdAsync(id);
        if (request is null) return null;
        request.RequestStatus = dto.RequestStatus;
        var updated = await _repo.UpdateAsync(request);
        return AdoptionRequestMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _repo.GetByIdAsync(id);
        if (request is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}

public class MarketplaceItemService : IMarketplaceItemService
{
    private readonly IMarketplaceItemRepository _repo;
    public MarketplaceItemService(IMarketplaceItemRepository repo) => _repo = repo;

    public async Task<IEnumerable<MarketplaceItemDto>> GetAllAsync()
    {
        var items = await _repo.GetAllAsync();
        return items.Select(MarketplaceItemMapper.ToDto);
    }

    public async Task<MarketplaceItemDto?> GetByIdAsync(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item is null ? null : MarketplaceItemMapper.ToDto(item);
    }

    public async Task<MarketplaceItemDto> CreateAsync(CreateMarketplaceItemDto dto)
    {
        var item = new MarketplaceItem
        {
            IdUser = dto.IdUser,
            Title = dto.Title,
            Category = dto.Category,
            Description = dto.Description,
            ItemCondition = dto.ItemCondition,
            Price = dto.Price,
            Region = dto.Region,
            MainPhoto = dto.MainPhoto,
            PublishedDate = DateTime.UtcNow,
            PublicationStatus = "Active"
        };
        var created = await _repo.CreateAsync(item);
        return MarketplaceItemMapper.ToDto(created);
    }

    public async Task<MarketplaceItemDto?> UpdateAsync(int id, UpdateMarketplaceItemDto dto)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item is null) return null;
        item.Title = dto.Title;
        item.Category = dto.Category;
        item.Description = dto.Description;
        item.ItemCondition = dto.ItemCondition;
        item.Price = dto.Price;
        item.Region = dto.Region;
        item.MainPhoto = dto.MainPhoto;
        item.PublicationStatus = dto.PublicationStatus;
        var updated = await _repo.UpdateAsync(item);
        return MarketplaceItemMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item is null) return false;
        await _repo.DeleteAsync(id);
        return true;
    }
}

public class ConsultationService : IConsultationService
{
    private readonly IConsultationRepository _repo;
    public ConsultationService(IConsultationRepository repo) => _repo = repo;

    public async Task<ConsultationDto?> GetByIdAsync(int id)
    {
        var c = await _repo.GetByIdAsync(id);
        return c is null ? null : ConsultationMapper.ToDto(c);
    }

    public async Task<IEnumerable<ConsultationDto>> GetBySenderIdAsync(int senderUserId)
    {
        var items = await _repo.GetBySenderIdAsync(senderUserId);
        return items.Select(ConsultationMapper.ToDto);
    }

    public async Task<IEnumerable<ConsultationDto>> GetByReceiverIdAsync(int receiverUserId)
    {
        var items = await _repo.GetByReceiverIdAsync(receiverUserId);
        return items.Select(ConsultationMapper.ToDto);
    }

    public async Task<ConsultationDto> CreateAsync(CreateConsultationDto dto)
    {
        var consultation = new Consultation
        {
            SenderIdUser = dto.SenderIdUser,
            ReceiverIdUser = dto.ReceiverIdUser,
            Subject = dto.Subject,
            Message = dto.Message,
            ConsultationStatus = "Open",
            SentDate = DateTime.UtcNow
        };
        var created = await _repo.CreateAsync(consultation);
        return ConsultationMapper.ToDto(created);
    }

    public async Task<ConsultationDto?> UpdateStatusAsync(int id, UpdateConsultationStatusDto dto)
    {
        var consultation = await _repo.GetByIdAsync(id);
        if (consultation is null) return null;
        consultation.ConsultationStatus = dto.ConsultationStatus;
        var updated = await _repo.UpdateAsync(consultation);
        return ConsultationMapper.ToDto(updated);
    }
}

public class ConsultationResponseService : IConsultationResponseService
{
    private readonly IConsultationResponseRepository _repo;
    public ConsultationResponseService(IConsultationResponseRepository repo) => _repo = repo;

    public async Task<IEnumerable<ConsultationResponseDto>> GetByConsultationIdAsync(int consultationId)
    {
        var responses = await _repo.GetByConsultationIdAsync(consultationId);
        return responses.Select(r => new ConsultationResponseDto
        {
            IdConsultationResponse = r.IdConsultationResponse,
            IdConsultation = r.IdConsultation,
            IdUser = r.IdUser,
            ResponseMessage = r.ResponseMessage,
            ResponseDate = r.ResponseDate
        });
    }

    public async Task<ConsultationResponseDto> CreateAsync(CreateConsultationResponseDto dto)
    {
        var response = new ConsultationResponse
        {
            IdConsultation = dto.IdConsultation,
            IdUser = dto.IdUser,
            ResponseMessage = dto.ResponseMessage,
            ResponseDate = DateTime.UtcNow
        };
        var created = await _repo.CreateAsync(response);
        return new ConsultationResponseDto
        {
            IdConsultationResponse = created.IdConsultationResponse,
            IdConsultation = created.IdConsultation,
            IdUser = created.IdUser,
            ResponseMessage = created.ResponseMessage,
            ResponseDate = created.ResponseDate
        };
    }
}
