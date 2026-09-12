namespace Adopaws.Application.DTOs;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Region { get; set; }
    public string UserType { get; set; } = "adopter";
    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
}

/// <summary>
/// Returned by /api/auth/login and /api/auth/register.
/// Matches the shape the frontend's authService already expects
/// (it spreads this into its stored "user" object plus a bearer token).
/// </summary>
public class AuthResultDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public UserDto User { get; set; } = null!;
}
