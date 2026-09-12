using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Adopaws.Api.Controllers;

[ApiController]
[Route("api/pet-photos")]
public class PetPhotosController : ControllerBase
{
    private readonly IPetPhotoService _service;
    public PetPhotosController(IPetPhotoService service) => _service = service;

    [HttpGet("by-pet/{petId:int}")]
    public async Task<IActionResult> GetByPet(int petId)
        => Ok(await _service.GetByPetIdAsync(petId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePetPhotoDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/adoption-requests")]
public class AdoptionRequestsController : ControllerBase
{
    private readonly IAdoptionRequestService _service;
    public AdoptionRequestsController(IAdoptionRequestService service) => _service = service;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("by-pet/{petId:int}")]
    public async Task<IActionResult> GetByPet(int petId)
        => Ok(await _service.GetByPetIdAsync(petId));

    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
        => Ok(await _service.GetByUserIdAsync(userId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdoptionRequestDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAdoptionRequestStatusDto dto)
    {
        var updated = await _service.UpdateStatusAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
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
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMarketplaceItemDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.IdMarketplaceItem }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMarketplaceItemDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

[ApiController]
[Route("api/consultations")]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _service;
    public ConsultationsController(IConsultationService service) => _service = service;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("by-sender/{senderUserId:int}")]
    public async Task<IActionResult> GetBySender(int senderUserId)
        => Ok(await _service.GetBySenderIdAsync(senderUserId));

    [HttpGet("by-receiver/{receiverUserId:int}")]
    public async Task<IActionResult> GetByReceiver(int receiverUserId)
        => Ok(await _service.GetByReceiverIdAsync(receiverUserId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConsultationDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.IdConsultation }, created);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateConsultationStatusDto dto)
    {
        var updated = await _service.UpdateStatusAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }
}

[ApiController]
[Route("api/consultation-responses")]
public class ConsultationResponsesController : ControllerBase
{
    private readonly IConsultationResponseService _service;
    public ConsultationResponsesController(IConsultationResponseService service) => _service = service;

    [HttpGet("by-consultation/{consultationId:int}")]
    public async Task<IActionResult> GetByConsultation(int consultationId)
        => Ok(await _service.GetByConsultationIdAsync(consultationId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConsultationResponseDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return StatusCode(201, created);
    }
}
