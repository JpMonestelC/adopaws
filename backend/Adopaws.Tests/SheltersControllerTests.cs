using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class SheltersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IPetService> _mockPetService;
    private readonly SheltersController _controller;

    public SheltersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockPetService = new Mock<IPetService>();
        _controller = new SheltersController(_mockUserService.Object, _mockPetService.Object);
    }

    [Fact]
    public async Task GetAll_DebeRetornarSoloRefugios_SinNecesitarAutenticacion()
    {
        var refugios = new List<UserDto> { new UserDto { IdUser = 1, FullName = "Refugio Feliz", UserType = "shelter" } };
        _mockUserService.Setup(s => s.GetSheltersAsync()).ReturnsAsync(refugios);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(refugios, ok.Value);
    }

    [Fact]
    public async Task GetById_DebeRetornar404SiElUsuarioNoEsRefugio()
    {
        // GetShelterByIdAsync devuelve null a propósito para un id que existe
        // pero no es de tipo "shelter" — ver UserService.GetShelterByIdAsync.
        _mockUserService.Setup(s => s.GetShelterByIdAsync(5)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(5);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetById_DebeRetornarElRefugioSiExiste()
    {
        var refugio = new UserDto { IdUser = 1, FullName = "Refugio Feliz", UserType = "shelter" };
        _mockUserService.Setup(s => s.GetShelterByIdAsync(1)).ReturnsAsync(refugio);

        var result = await _controller.GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(refugio, ok.Value);
    }

    [Fact]
    public async Task GetPets_DebeRetornar404SiElRefugioNoExiste()
    {
        _mockUserService.Setup(s => s.GetShelterByIdAsync(1)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetPets(1);

        Assert.IsType<NotFoundResult>(result);
        _mockPetService.Verify(s => s.GetByUserIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task GetPets_DebeRetornarLasMascotasDelRefugio()
    {
        var refugio = new UserDto { IdUser = 1, FullName = "Refugio Feliz", UserType = "shelter" };
        var mascotas = new List<PetDto> { new PetDto { IdPet = 10, IdUser = 1, Name = "Luna" } };
        _mockUserService.Setup(s => s.GetShelterByIdAsync(1)).ReturnsAsync(refugio);
        _mockPetService.Setup(s => s.GetByUserIdAsync(1)).ReturnsAsync(mascotas);

        var result = await _controller.GetPets(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(mascotas, ok.Value);
    }
}
