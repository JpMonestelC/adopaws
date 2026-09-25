using Adopaws.Api.Extensions;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

/// <summary>
/// Both routes take userId in the URL, but only ever compute compatibility
/// for the caller's own account — otherwise anyone could read anyone else's
/// compatibility results (and the profile details baked into the
/// explanation) just by changing the id in the URL.
/// </summary>
[ApiController]
[Route("api/compatibility")]
[Authorize]
public class CompatibilityController : ControllerBase
{
    private readonly ICompatibilityService _compatibilityService;

    public CompatibilityController(ICompatibilityService compatibilityService)
    {
        _compatibilityService = compatibilityService;
    }

    /// <summary>
    /// Returns a compatibility score and explanation between a user and a specific pet.
    /// </summary>
    [HttpGet("{userId:int}/{petId:int}")]
    public async Task<IActionResult> GetCompatibility(int userId, int petId)
    {
        var callerId = User.GetUserId();
        if (callerId is null) return Unauthorized();
        if (callerId.Value != userId) return Forbid();

        var result = await _compatibilityService.GetCompatibilityAsync(userId, petId);
        return Ok(result);
    }

    /// <summary>
    /// Returns a ranked list of recommended pets for a user, sorted by compatibility score.
    /// </summary>
    [HttpGet("recommendations/{userId:int}")]
    public async Task<IActionResult> GetRecommendations(int userId, [FromQuery] int topN = 10)
    {
        var callerId = User.GetUserId();
        if (callerId is null) return Unauthorized();
        if (callerId.Value != userId) return Forbid();

        var result = await _compatibilityService.GetRecommendationsAsync(userId, topN);
        return Ok(result);
    }
}
