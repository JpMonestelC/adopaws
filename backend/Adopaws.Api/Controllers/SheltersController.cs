using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

/// <summary>
/// Public shelters directory. Replaces the earlier simulation (the frontend
/// used to fetch ALL of /api/users and filter client-side for
/// userType === 'shelter' — see services/api.js history), which exposed
/// every account's data just to build a public directory. This controller
/// filters server-side instead, so a shelter's public profile and pet list
/// stays public but the full user table no longer needs to be.
/// </summary>
[ApiController]
[Route("api/shelters")]
[AllowAnonymous]
public class SheltersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPetService _petService;

    public SheltersController(IUserService userService, IPetService petService)
    {
        _userService = userService;
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var shelters = await _userService.GetSheltersAsync();
        return Ok(shelters);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var shelter = await _userService.GetShelterByIdAsync(id);
        return shelter is null ? NotFound() : Ok(shelter);
    }

    [HttpGet("{id:int}/pets")]
    public async Task<IActionResult> GetPets(int id)
    {
        var shelter = await _userService.GetShelterByIdAsync(id);
        if (shelter is null) return NotFound();

        var pets = await _petService.GetByUserIdAsync(id);
        return Ok(pets);
    }
}
