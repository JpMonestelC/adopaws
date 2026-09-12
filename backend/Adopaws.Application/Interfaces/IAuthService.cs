using Adopaws.Application.DTOs;

namespace Adopaws.Application.Interfaces;

public interface IAuthService
{
    /// <summary>Verifies credentials and issues a JWT. Throws UnauthorizedAccessException on bad credentials.</summary>
    Task<AuthResultDto> LoginAsync(LoginRequestDto request);

    /// <summary>Creates a new user with a hashed password and issues a JWT. Throws InvalidOperationException if the email is already registered.</summary>
    Task<AuthResultDto> RegisterAsync(RegisterRequestDto request);
}
