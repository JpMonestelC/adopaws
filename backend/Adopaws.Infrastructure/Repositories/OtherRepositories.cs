using Adopaws.Application.Interfaces;
using Adopaws.Domain.Entities;
using Adopaws.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Adopaws.Infrastructure.Repositories;

public class PetRepository : IPetRepository
{
    private readonly AdopawsDbContext _context;
    public PetRepository(AdopawsDbContext context) => _context = context;

    public async Task<IEnumerable<Pet>> GetAllAsync()
        => await _context.Pets.AsNoTracking().ToListAsync();

    public async Task<Pet?> GetByIdAsync(int id)
        => await _context.Pets.Include(p => p.PetPhotos).FirstOrDefaultAsync(p => p.IdPet == id);

    public async Task<IEnumerable<Pet>> GetByUserIdAsync(int userId)
        => await _context.Pets.AsNoTracking().Where(p => p.IdUser == userId).ToListAsync();

    public async Task<Pet> CreateAsync(Pet pet)
    {
        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();
        return pet;
    }

    public async Task<Pet> UpdateAsync(Pet pet)
    {
        _context.Pets.Update(pet);
        await _context.SaveChangesAsync();
        return pet;
    }

    public async Task DeleteAsync(int id)
    {
        var pet = await _context.Pets.FindAsync(id);
        if (pet is not null)
        {
            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
        }
    }
}

public class PetPhotoRepository : IPetPhotoRepository
{
    private readonly AdopawsDbContext _context;
    public PetPhotoRepository(AdopawsDbContext context) => _context = context;

    public async Task<IEnumerable<PetPhoto>> GetByPetIdAsync(int petId)
        => await _context.PetPhotos.AsNoTracking().Where(p => p.IdPet == petId).ToListAsync();

    public async Task<PetPhoto?> GetByIdAsync(int id)
        => await _context.PetPhotos.FindAsync(id);

    public async Task<PetPhoto> CreateAsync(PetPhoto petPhoto)
    {
        _context.PetPhotos.Add(petPhoto);
        await _context.SaveChangesAsync();
        return petPhoto;
    }

    public async Task DeleteAsync(int id)
    {
        var photo = await _context.PetPhotos.FindAsync(id);
        if (photo is not null)
        {
            _context.PetPhotos.Remove(photo);
            await _context.SaveChangesAsync();
        }
    }
}

public class AdoptionRequestRepository : IAdoptionRequestRepository
{
    private readonly AdopawsDbContext _context;
    public AdoptionRequestRepository(AdopawsDbContext context) => _context = context;

    public async Task<AdoptionRequest?> GetByIdAsync(int id)
        => await _context.AdoptionRequests.FindAsync(id);

    public async Task<IEnumerable<AdoptionRequest>> GetByPetIdAsync(int petId)
        => await _context.AdoptionRequests.AsNoTracking().Where(r => r.IdPet == petId).ToListAsync();

    public async Task<IEnumerable<AdoptionRequest>> GetByUserIdAsync(int userId)
        => await _context.AdoptionRequests.AsNoTracking().Where(r => r.IdUser == userId).ToListAsync();

    public async Task<bool> ExistsAsync(int petId, int userId)
        => await _context.AdoptionRequests.AnyAsync(r => r.IdPet == petId && r.IdUser == userId);

    public async Task<AdoptionRequest> CreateAsync(AdoptionRequest request)
    {
        _context.AdoptionRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<AdoptionRequest> UpdateAsync(AdoptionRequest request)
    {
        _context.AdoptionRequests.Update(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task DeleteAsync(int id)
    {
        var request = await _context.AdoptionRequests.FindAsync(id);
        if (request is not null)
        {
            _context.AdoptionRequests.Remove(request);
            await _context.SaveChangesAsync();
        }
    }
}

public class MarketplaceItemRepository : IMarketplaceItemRepository
{
    private readonly AdopawsDbContext _context;
    public MarketplaceItemRepository(AdopawsDbContext context) => _context = context;

    public async Task<IEnumerable<MarketplaceItem>> GetAllAsync()
        => await _context.MarketplaceItems.AsNoTracking().ToListAsync();

    public async Task<MarketplaceItem?> GetByIdAsync(int id)
        => await _context.MarketplaceItems.FindAsync(id);

    public async Task<IEnumerable<MarketplaceItem>> GetByUserIdAsync(int userId)
        => await _context.MarketplaceItems.AsNoTracking().Where(m => m.IdUser == userId).ToListAsync();

    public async Task<MarketplaceItem> CreateAsync(MarketplaceItem item)
    {
        _context.MarketplaceItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<MarketplaceItem> UpdateAsync(MarketplaceItem item)
    {
        _context.MarketplaceItems.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task DeleteAsync(int id)
    {
        var item = await _context.MarketplaceItems.FindAsync(id);
        if (item is not null)
        {
            _context.MarketplaceItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}

public class ConsultationRepository : IConsultationRepository
{
    private readonly AdopawsDbContext _context;
    public ConsultationRepository(AdopawsDbContext context) => _context = context;

    public async Task<Consultation?> GetByIdAsync(int id)
        => await _context.Consultations.Include(c => c.Responses).FirstOrDefaultAsync(c => c.IdConsultation == id);

    public async Task<IEnumerable<Consultation>> GetBySenderIdAsync(int senderUserId)
        => await _context.Consultations.AsNoTracking().Where(c => c.SenderIdUser == senderUserId).ToListAsync();

    public async Task<IEnumerable<Consultation>> GetByReceiverIdAsync(int receiverUserId)
        => await _context.Consultations.AsNoTracking().Where(c => c.ReceiverIdUser == receiverUserId).ToListAsync();

    public async Task<Consultation> CreateAsync(Consultation consultation)
    {
        _context.Consultations.Add(consultation);
        await _context.SaveChangesAsync();
        return consultation;
    }

    public async Task<Consultation> UpdateAsync(Consultation consultation)
    {
        _context.Consultations.Update(consultation);
        await _context.SaveChangesAsync();
        return consultation;
    }
}

public class ConsultationResponseRepository : IConsultationResponseRepository
{
    private readonly AdopawsDbContext _context;
    public ConsultationResponseRepository(AdopawsDbContext context) => _context = context;

    public async Task<IEnumerable<ConsultationResponse>> GetByConsultationIdAsync(int consultationId)
        => await _context.ConsultationResponses.AsNoTracking().Where(r => r.IdConsultation == consultationId).ToListAsync();

    public async Task<ConsultationResponse?> GetByIdAsync(int id)
        => await _context.ConsultationResponses.FindAsync(id);

    public async Task<ConsultationResponse> CreateAsync(ConsultationResponse response)
    {
        _context.ConsultationResponses.Add(response);
        await _context.SaveChangesAsync();
        return response;
    }
}
