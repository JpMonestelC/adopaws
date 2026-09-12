using Adopaws.Domain.Entities;

namespace Adopaws.Application.Interfaces;

public interface IPetRepository
{
    Task<IEnumerable<Pet>> GetAllAsync();
    Task<Pet?> GetByIdAsync(int id);
    Task<IEnumerable<Pet>> GetByUserIdAsync(int userId);
    Task<Pet> CreateAsync(Pet pet);
    Task<Pet> UpdateAsync(Pet pet);
    Task DeleteAsync(int id);
}
