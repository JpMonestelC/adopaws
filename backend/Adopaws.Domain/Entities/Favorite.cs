namespace Adopaws.Domain.Entities;

/// <summary>
/// Represents a pet a user has bookmarked. Replaces the earlier
/// localStorage-only simulation (see frontend services/api.js history) with a
/// real per-user record so favorites follow the account across devices.
/// </summary>
public class Favorite
{
    public int IdFavorite { get; set; }
    public int IdUser { get; set; }
    public int IdPet { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public User User { get; set; } = null!;
    public Pet Pet { get; set; } = null!;
}
