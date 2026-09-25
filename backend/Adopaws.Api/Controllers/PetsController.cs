using Adopaws.Api.Extensions;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

[ApiController]
[Route("api/pets")]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var pets = await _petService.GetAllAsync();
        return Ok(pets);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var pet = await _petService.GetByIdAsync(id);
        return pet is null ? NotFound() : Ok(pet);
    }

    /// <summary>Publica una mascota a nombre del usuario autenticado (el dueño real
    /// nunca se toma de dto.IdUser, para que nadie pueda publicar a nombre de otro).</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePetDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var created = await _petService.CreateAsync(dto, userId.Value);
        return CreatedAtAction(nameof(GetById), new { id = created.IdPet }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePetDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var pet = await _petService.GetByIdAsync(id);
        if (pet is null) return NotFound();
        if (pet.IdUser != userId.Value) return Forbid();

        var updated = await _petService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var pet = await _petService.GetByIdAsync(id);
        if (pet is null) return NotFound();
        if (pet.IdUser != userId.Value) return Forbid();

        var result = await _petService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}
