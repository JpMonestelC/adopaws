using Adopaws.Api.Extensions;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

/// <summary>
/// Requires authentication for every read/write except Create (kept
/// AllowAnonymous because it is functionally an alternate registration path —
/// see UserService.CreateAsync, which hashes the password the same way
/// AuthController.Register does). The public shelters directory used to be
/// built by calling GetAll and filtering client-side; it now uses
/// SheltersController instead, so locking GetAll/GetById down here does not
/// break that public page.
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var created = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.IdUser }, created);
    }

    /// <summary>Un usuario solo puede editar su propio perfil.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (userId.Value != id) return Forbid();

        var updated = await _userService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    /// <summary>Un usuario solo puede eliminar su propia cuenta.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (userId.Value != id) return Forbid();

        var result = await _userService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}
