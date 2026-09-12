using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Adopaws.Application.Mappings;
using Adopaws.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Adopaws.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Correo o contraseña incorrectos.");

        if (!_passwordHasher.Verify(request.Password, user.Password))
            throw new UnauthorizedAccessException("Correo o contraseña incorrectos.");

        if (user.Status != "Active")
            throw new UnauthorizedAccessException("Esta cuenta no está activa.");

        return BuildAuthResult(user);
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterRequestDto request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing is not null)
            throw new InvalidOperationException("Ya existe una cuenta con ese correo.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Password = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            Region = request.Region,
            UserType = string.IsNullOrWhiteSpace(request.UserType) ? "adopter" : request.UserType,
            ProfileDescription = request.ProfileDescription,
            ProfileImage = request.ProfileImage,
            RegistrationDate = DateTime.UtcNow,
            Status = "Active",
            IsVerified = false
        };

        var created = await _userRepository.CreateAsync(user);
        return BuildAuthResult(created);
    }

    private AuthResultDto BuildAuthResult(User user)
    {
        var expiresInMinutes = int.TryParse(_configuration["Jwt:ExpiresInMinutes"], out var minutes) ? minutes : 60;
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        return new AuthResultDto
        {
            Token = GenerateJwt(user, expiresAtUtc),
            ExpiresAtUtc = expiresAtUtc,
            User = UserMapper.ToDto(user)
        };
    }

    private string GenerateJwt(User user, DateTime expiresAtUtc)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured.");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.IdUser.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.IdUser.ToString()),
            new Claim(ClaimTypes.Role, user.UserType),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
