using System.ComponentModel.DataAnnotations;

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
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }

    [Required]
    [StringLength(50)]
    public string UserType { get; set; } = string.Empty;

    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }
}

public class UpdateUserDto
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Region { get; set; }

    public string? ProfileDescription { get; set; }
    public string? ProfileImage { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;
}
