using Adopaws.Api.Extensions;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

[ApiController]
[Route("api/pet-photos")]
public class PetPhotosController : ControllerBase
{
    private readonly IPetPhotoService _service;
    private readonly IPetService _petService;

    public PetPhotosController(IPetPhotoService service, IPetService petService)
    {
        _service = service;
        _petService = petService;
    }

    [HttpGet("by-pet/{petId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPet(int petId)
        => Ok(await _service.GetByPetIdAsync(petId));

    /// <summary>Solo el dueño de la mascota puede agregarle fotos.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePetPhotoDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var pet = await _petService.GetByIdAsync(dto.IdPet);
        if (pet is null) return NotFound();
        if (pet.IdUser != userId.Value) return Forbid();

        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }

    /// <summary>Solo el dueño de la mascota puede eliminar sus fotos.</summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var photo = await _service.GetByIdAsync(id);
        if (photo is null) return NotFound();

        var pet = await _petService.GetByIdAsync(photo.IdPet);
        if (pet is null) return NotFound();
        if (pet.IdUser != userId.Value) return Forbid();

        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/adoption-requests")]
[Authorize]
public class AdoptionRequestsController : ControllerBase
{
    private readonly IAdoptionRequestService _service;
    private readonly IPetService _petService;

    public AdoptionRequestsController(IAdoptionRequestService service, IPetService petService)
    {
        _service = service;
        _petService = petService;
    }

    /// <summary>Visible para quien la envió o para el dueño de la mascota.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound();

        if (result.IdUser != userId.Value)
        {
            var pet = await _petService.GetByIdAsync(result.IdPet);
            if (pet is null || pet.IdUser != userId.Value) return Forbid();
        }

        return Ok(result);
    }

    /// <summary>Solo el dueño de la mascota ve las solicitudes que recibió.</summary>
    [HttpGet("by-pet/{petId:int}")]
    public async Task<IActionResult> GetByPet(int petId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var pet = await _petService.GetByIdAsync(petId);
        if (pet is null) return NotFound();
        if (pet.IdUser != userId.Value) return Forbid();

        return Ok(await _service.GetByPetIdAsync(petId));
    }

    /// <summary>Solo el propio usuario ve sus solicitudes enviadas.</summary>
    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var callerId = User.GetUserId();
        if (callerId is null) return Unauthorized();
        if (callerId.Value != userId) return Forbid();

        return Ok(await _service.GetByUserIdAsync(userId));
    }

    /// <summary>El solicitante real se toma del JWT, nunca de dto.IdUser.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdoptionRequestDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        dto.IdUser = userId.Value;
        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }

    /// <summary>Solo el dueño de la mascota puede aprobar/rechazar una solicitud.</summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAdoptionRequestStatusDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        var pet = await _petService.GetByIdAsync(existing.IdPet);
        if (pet is null || pet.IdUser != userId.Value) return Forbid();

        var updated = await _service.UpdateStatusAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    /// <summary>El solicitante puede retirar su solicitud; el dueño de la mascota también puede eliminarla.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        if (existing.IdUser != userId.Value)
        {
            var pet = await _petService.GetByIdAsync(existing.IdPet);
            if (pet is null || pet.IdUser != userId.Value) return Forbid();
        }

        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/marketplace-items")]
public class MarketplaceItemsController : ControllerBase
{
    private readonly IMarketplaceItemService _service;
    public MarketplaceItemsController(IMarketplaceItemService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>El dueño real se toma del JWT, nunca de dto.IdUser.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateMarketplaceItemDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        dto.IdUser = userId.Value;
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.IdMarketplaceItem }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMarketplaceItemDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (existing.IdUser != userId.Value) return Forbid();

        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (existing.IdUser != userId.Value) return Forbid();

        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/consultations")]
[Authorize]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _service;
    public ConsultationsController(IConsultationService service) => _service = service;

    /// <summary>Visible solo para el remitente o el destinatario.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _service.GetByIdAsync(id);
        if (result is null) return NotFound();
        if (result.SenderIdUser != userId.Value && result.ReceiverIdUser != userId.Value) return Forbid();

        return Ok(result);
    }

    [HttpGet("by-sender/{senderUserId:int}")]
    public async Task<IActionResult> GetBySender(int senderUserId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (userId.Value != senderUserId) return Forbid();

        return Ok(await _service.GetBySenderIdAsync(senderUserId));
    }

    [HttpGet("by-receiver/{receiverUserId:int}")]
    public async Task<IActionResult> GetByReceiver(int receiverUserId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (userId.Value != receiverUserId) return Forbid();

        return Ok(await _service.GetByReceiverIdAsync(receiverUserId));
    }

    /// <summary>El remitente real se toma del JWT, nunca de dto.SenderIdUser.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConsultationDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        dto.SenderIdUser = userId.Value;
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.IdConsultation }, created);
    }

    /// <summary>Cualquiera de las dos partes puede actualizar el estado (responder/cerrar).</summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateConsultationStatusDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null) return NotFound();
        if (existing.SenderIdUser != userId.Value && existing.ReceiverIdUser != userId.Value) return Forbid();

        var updated = await _service.UpdateStatusAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }
}

[ApiController]
[Route("api/consultation-responses")]
[Authorize]
public class ConsultationResponsesController : ControllerBase
{
    private readonly IConsultationResponseService _service;
    private readonly IConsultationService _consultationService;

    public ConsultationResponsesController(
        IConsultationResponseService service,
        IConsultationService consultationService)
    {
        _service = service;
        _consultationService = consultationService;
    }

    /// <summary>Visible solo para quien participa en esa consulta.</summary>
    [HttpGet("by-consultation/{consultationId:int}")]
    public async Task<IActionResult> GetByConsultation(int consultationId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var consultation = await _consultationService.GetByIdAsync(consultationId);
        if (consultation is null) return NotFound();
        if (consultation.SenderIdUser != userId.Value && consultation.ReceiverIdUser != userId.Value) return Forbid();

        return Ok(await _service.GetByConsultationIdAsync(consultationId));
    }

    /// <summary>El autor real se toma del JWT; además debe ser parte de la consulta.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConsultationResponseDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var consultation = await _consultationService.GetByIdAsync(dto.IdConsultation);
        if (consultation is null) return NotFound();
        if (consultation.SenderIdUser != userId.Value && consultation.ReceiverIdUser != userId.Value) return Forbid();

        dto.IdUser = userId.Value;
        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }
}
