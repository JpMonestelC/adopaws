using Adopaws.Application.DTOs;

namespace Adopaws.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto);
    Task<bool> DeleteAsync(int id);

    // Usados por SheltersController (directorio público de refugios: usuarios
    // con UserType == "shelter"). GetShelterByIdAsync devuelve null si el id
    // existe pero no es de tipo refugio, para no filtrar datos de otros
    // usuarios a través de una ruta pensada para ser pública.
    Task<IEnumerable<UserDto>> GetSheltersAsync();
    Task<UserDto?> GetShelterByIdAsync(int id);
}
