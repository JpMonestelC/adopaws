namespace Adopaws.Application.DTOs;

/// <summary>
/// A favorited pet, returned to the caller who owns it. IdUser is
/// intentionally absent here — every Favorites endpoint scopes to the
/// caller's own JWT identity (see FavoritesController), so the DTO never
/// needs to say whose favorite it is.
/// </summary>
public class FavoriteDto
{
    public int IdFavorite { get; set; }
    public int IdPet { get; set; }
    public DateTime CreatedDate { get; set; }
    public PetDto Pet { get; set; } = null!;
}
