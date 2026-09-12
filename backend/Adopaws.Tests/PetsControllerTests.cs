using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class PetsControllerTests
{
    private readonly Mock<IPetService> _mockService;
    private readonly PetsController _controller;

    public PetsControllerTests()
    {
        _mockService = new Mock<IPetService>();
        _controller = new PetsController(_mockService.Object);
    }

    // ─── GetAll ───────────────────────────────────────────
    [Fact]
    public async Task GetAll_DebeRetornarListaDeMascotas()
    {
        var mascotas = new List<PetDto>
        {
            new PetDto { IdPet = 1, Name = "Firulais", PetType = "dog" },
            new PetDto { IdPet = 2, Name = "Michi", PetType = "cat" }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(mascotas);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(mascotas, ok.Value);
    }

    [Fact]
    public async Task GetAll_DebeRetornarListaVacia()
    {
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<PetDto>());

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<PetDto>>(ok.Value);
        Assert.Empty(lista);
    }

    // ─── GetById ──────────────────────────────────────────
    [Fact]
    public async Task GetById_DebeRetornarMascotaExistente()
    {
        var mascota = new PetDto { IdPet = 1, Name = "Firulais", PetType = "dog" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(mascota);

        var result = await _controller.GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(mascota, ok.Value);
    }

    [Fact]
    public async Task GetById_DebeRetornar404SiNoExiste()
    {
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((PetDto?)null);

        var result = await _controller.GetById(999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Create ───────────────────────────────────────────
    [Fact]
    public async Task Create_DebeCrearMascotaCorrectamente()
    {
        var dto = new CreatePetDto
        {
            IdUser = 1,
            Name = "Rex",
            PetType = "dog",
            Breed = "Labrador",
            Age = 2,
            Gender = "male",
            Size = "large",
            Vaccinated = true,
            Sterilized = false,
            Description = "Muy juguetón",
            Region = "San José"
        };
        var creado = new PetDto { IdPet = 3, Name = "Rex", PetType = "dog" };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(creado);

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(creado, created.Value);
    }

    // ─── Update ───────────────────────────────────────────
    [Fact]
    public async Task Update_DebeActualizarMascotaCorrectamente()
    {
        var dto = new UpdatePetDto { Name = "Rex Actualizado", PublicationStatus = "Active" };
        var actualizado = new PetDto { IdPet = 1, Name = "Rex Actualizado" };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(actualizado);

        var result = await _controller.Update(1, dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(actualizado, ok.Value);
    }

    [Fact]
    public async Task Update_DebeRetornar404SiNoExiste()
    {
        var dto = new UpdatePetDto { Name = "X", PublicationStatus = "Active" };
        _mockService.Setup(s => s.UpdateAsync(999, dto)).ReturnsAsync((PetDto?)null);

        var result = await _controller.Update(999, dto);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Delete ───────────────────────────────────────────
    [Fact]
    public async Task Delete_DebeEliminarMascotaCorrectamente()
    {
        _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_DebeRetornar404SiNoExiste()
    {
        _mockService.Setup(s => s.DeleteAsync(999)).ReturnsAsync(false);

        var result = await _controller.Delete(999);

        Assert.IsType<NotFoundResult>(result);
    }
    //-------------------------------------// ─── Manejo de errores ────────────────────────────────
    [Fact]
    public async Task Create_DebeRetornarErrorSiDatosInvalidos()
    {
        var dto = new CreatePetDto { Name = "", PetType = "" };
        _mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Datos inválidos"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.Create(dto));
    }

    [Fact]
    public async Task GetById_DebeRetornar404ConIdInvalido()
    {
        _mockService.Setup(s => s.GetByIdAsync(0)).ReturnsAsync((PetDto?)null);

        var result = await _controller.GetById(0);

        Assert.IsType<NotFoundResult>(result);
    }
}