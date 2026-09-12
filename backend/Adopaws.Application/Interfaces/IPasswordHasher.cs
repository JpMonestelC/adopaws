namespace Adopaws.Application.Interfaces;

/// <summary>
/// Abstracts password hashing so Application/Domain never depend on a concrete
/// crypto library. Implemented in Adopaws.Infrastructure (BCrypt.Net-Next).
/// </summary>
public interface IPasswordHasher
{
    string Hash(string plainTextPassword);
    bool Verify(string plainTextPassword, string hashedPassword);
}
