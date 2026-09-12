using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Adopaws.Application.Mappings;
using Adopaws.Domain.Entities;

namespace Adopaws.Application.Services;

public class PetService : IPetService
{
    private readonly IPetRepository _petRepository;

    public PetService(IPetRepository petRepository)
    {
        _petRepository = petRepository;
    }

    public async Task<IEnumerable<PetDto>> GetAllAsync()
    {
        var pets = await _petRepository.GetAllAsync();
        return pets.Select(PetMapper.ToDto);
    }

    public async Task<PetDto?> GetByIdAsync(int id)
    {
        var pet = await _petRepository.GetByIdAsync(id);
        return pet is null ? null : PetMapper.ToDto(pet);
    }

    public async Task<PetDto> CreateAsync(CreatePetDto dto)
    {
        var pet = new Pet
        {
            IdUser = dto.IdUser,
            Name = dto.Name,
            PetType = dto.PetType,
            Breed = dto.Breed,
            Age = dto.Age,
            Gender = dto.Gender,
            Size = dto.Size,
            Vaccinated = dto.Vaccinated,
            Sterilized = dto.Sterilized,
            Description = dto.Description,
            Region = dto.Region,
            PublicationStatus = "Available",
            PublishedDate = DateTime.UtcNow
        };

        var created = await _petRepository.CreateAsync(pet);
        return PetMapper.ToDto(created);
    }

    public async Task<PetDto?> UpdateAsync(int id, UpdatePetDto dto)
    {
        var pet = await _petRepository.GetByIdAsync(id);
        if (pet is null) return null;

        pet.Name = dto.Name;
        pet.Breed = dto.Breed;
        pet.Age = dto.Age;
        pet.Gender = dto.Gender;
        pet.Size = dto.Size;
        pet.Vaccinated = dto.Vaccinated;
        pet.Sterilized = dto.Sterilized;
        pet.Description = dto.Description;
        pet.Region = dto.Region;
        pet.PublicationStatus = dto.PublicationStatus;

        var updated = await _petRepository.UpdateAsync(pet);
        return PetMapper.ToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pet = await _petRepository.GetByIdAsync(id);
        if (pet is null) return false;

        await _petRepository.DeleteAsync(id);
        return true;
    }
}
