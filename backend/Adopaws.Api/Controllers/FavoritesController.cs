using Adopaws.Api.Extensions;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

/// <summary>
/// Real, per-account favorites (replaces the earlier localStorage-only
/// simulation — see frontend services/api.js history). Every route is
/// scoped to the caller's own JWT identity: none of them accept a userId
/// from the route or body, so a caller can only ever see or change their
/// own favorites.
/// </summary>
[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;
    public FavoritesController(IFavoriteService favoriteService) => _favoriteService = favoriteService;

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var favorites = await _favoriteService.GetByUserIdAsync(userId.Value);
        return Ok(favorites);
    }

    [HttpGet("check/{petId:int}")]
    public async Task<IActionResult> Check(int petId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var isFavorite = await _favoriteService.IsFavoriteAsync(userId.Value, petId);
        return Ok(new { isFavorite });
    }

    [HttpPost("{petId:int}")]
    public async Task<IActionResult> Add(int petId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var (favorite, wasCreated) = await _favoriteService.AddAsync(userId.Value, petId);
        return wasCreated ? StatusCode(201, favorite) : Ok(favorite);
    }

    [HttpDelete("{petId:int}")]
    public async Task<IActionResult> Remove(int petId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var removed = await _favoriteService.RemoveAsync(userId.Value, petId);
        return removed ? NoContent() : NotFound();
    }
}
