namespace Adopaws.Application.DTOs;

public class UserDto
{
    // NOTE: Password is intentionally NOT exposed here. It never leaves the
    // server as plaintext or hash — see AuthService for login/register.
    public int IdUser { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Region { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
    public bool IsVerified { get; set; }
    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Region { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
}

public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Region { get; set; }
    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
    public string Status { get; set; } = string.Empty;
}
