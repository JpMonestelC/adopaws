using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

[ApiController]
[Route("api/compatibility")]
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
        var result = await _compatibilityService.GetCompatibilityAsync(userId, petId);
        return Ok(result);
    }

    /// <summary>
    /// Returns a ranked list of recommended pets for a user, sorted by compatibility score.
    /// </summary>
    [HttpGet("recommendations/{userId:int}")]
    public async Task<IActionResult> GetRecommendations(int userId, [FromQuery] int topN = 10)
    {
        var result = await _compatibilityService.GetRecommendationsAsync(userId, topN);
        return Ok(result);
    }
}
