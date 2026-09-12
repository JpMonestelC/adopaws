using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockService;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockService = new Mock<IUserService>();
        _controller = new UsersController(_mockService.Object);
    }

    // ─── GetAll ───────────────────────────────────────────
    [Fact]
    public async Task GetAll_DebeRetornarListaDeUsuarios()
    {
        var usuarios = new List<UserDto>
        {
            new UserDto { IdUser = 1, FullName = "Juan", Email = "juan@test.com" },
            new UserDto { IdUser = 2, FullName = "Ana", Email = "ana@test.com" }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(usuarios);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(usuarios, ok.Value);
    }

    [Fact]
    public async Task GetAll_DebeRetornarListaVacia()
    {
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<UserDto>());

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<UserDto>>(ok.Value);
        Assert.Empty(lista);
    }

    // ─── GetById ──────────────────────────────────────────
    [Fact]
    public async Task GetById_DebeRetornarUsuarioExistente()
    {
        var usuario = new UserDto { IdUser = 1, FullName = "Juan", Email = "juan@test.com" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(usuario);

        var result = await _controller.GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(usuario, ok.Value);
    }

    [Fact]
    public async Task GetById_DebeRetornar404SiNoExiste()
    {
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Create ───────────────────────────────────────────
    [Fact]
    public async Task Create_DebeCrearUsuarioCorrectamente()
    {
        var dto = new CreateUserDto
        {
            FullName = "Carlos",
            Email = "carlos@test.com",
            Password = "1234",
            UserType = "adopter"
        };
        var creado = new UserDto { IdUser = 3, FullName = "Carlos", Email = "carlos@test.com" };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(creado);

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(creado, created.Value);
    }

    // ─── Update ───────────────────────────────────────────
    [Fact]
    public async Task Update_DebeActualizarUsuarioCorrectamente()
    {
        var dto = new UpdateUserDto { FullName = "Juan Actualizado", Status = "Active" };
        var actualizado = new UserDto { IdUser = 1, FullName = "Juan Actualizado" };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(actualizado);

        var result = await _controller.Update(1, dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(actualizado, ok.Value);
    }

    [Fact]
    public async Task Update_DebeRetornar404SiNoExiste()
    {
        var dto = new UpdateUserDto { FullName = "X", Status = "Active" };
        _mockService.Setup(s => s.UpdateAsync(999, dto)).ReturnsAsync((UserDto?)null);

        var result = await _controller.Update(999, dto);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Delete ───────────────────────────────────────────
    [Fact]
    public async Task Delete_DebeEliminarUsuarioCorrectamente()
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
    //-------------------------------------
    // ─── Manejo de errores ────────────────────────────────
    [Fact]
    public async Task Create_DebeRetornarErrorSiEmailDuplicado()
    {
        var dto = new CreateUserDto
        {
            FullName = "Carlos",
            Email = "duplicado@test.com",
            Password = "1234",
            UserType = "adopter"
        };
        _mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Ya existe una cuenta con ese correo"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.Create(dto));
    }

    [Fact]
    public async Task GetById_DebeRetornar404ConIdInvalido()
    {
        _mockService.Setup(s => s.GetByIdAsync(0)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(0);

        Assert.IsType<NotFoundResult>(result);
    }
}