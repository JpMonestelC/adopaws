using Adopaws.Application.Interfaces;

namespace Adopaws.Infrastructure.Security;

/// <summary>
/// BCrypt-based implementation of IPasswordHasher. BCrypt.Net-Next embeds a
/// random salt in the resulting hash, so no separate salt column is needed.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string plainTextPassword)
        => BCrypt.Net.BCrypt.HashPassword(plainTextPassword);

    public bool Verify(string plainTextPassword, string hashedPassword)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(plainTextPassword, hashedPassword);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // hashedPassword isn't a valid BCrypt hash (e.g. a pre-existing
            // plaintext row from before this fix). Treat as no match rather
            // than throwing, so login just fails cleanly.
            return false;
        }
    }
}
