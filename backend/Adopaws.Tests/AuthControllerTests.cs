using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockService = new Mock<IAuthService>();
        _controller = new AuthController(_mockService.Object);
    }

    // ─── Login ────────────────────────────────────────────
    [Fact]
    public async Task Login_DebeRetornarTokenYUsuarioSiCredencialesValidas()
    {
        var dto = new LoginRequestDto { Email = "juan@test.com", Password = "1234" };
        var esperado = new AuthResultDto
        {
            Token = "fake.jwt.token",
            ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
            User = new UserDto { IdUser = 1, FullName = "Juan", Email = "juan@test.com" }
        };
        _mockService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(esperado);

        var result = await _controller.Login(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(esperado, ok.Value);
    }

    [Fact]
    public async Task Login_DebePropagar401SiCredencialesInvalidas()
    {
        var dto = new LoginRequestDto { Email = "juan@test.com", Password = "incorrecta" };
        _mockService.Setup(s => s.LoginAsync(dto))
            .ThrowsAsync(new UnauthorizedAccessException("Correo o contraseña incorrectos."));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _controller.Login(dto));
    }

    // ─── Register ─────────────────────────────────────────
    [Fact]
    public async Task Register_DebeCrearUsuarioYRetornar201ConToken()
    {
        var dto = new RegisterRequestDto
        {
            FullName = "Carlos",
            Email = "carlos@test.com",
            Password = "1234",
            UserType = "adopter"
        };
        var esperado = new AuthResultDto
        {
            Token = "fake.jwt.token",
            ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
            User = new UserDto { IdUser = 3, FullName = "Carlos", Email = "carlos@test.com" }
        };
        _mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(esperado);

        var result = await _controller.Register(dto);

        var created = Assert.IsType<ObjectResult>(result);
        Assert.Equal(201, created.StatusCode);
        Assert.Equal(esperado, created.Value);
    }

    [Fact]
    public async Task Register_DebePropagarErrorSiEmailDuplicado()
    {
        var dto = new RegisterRequestDto
        {
            FullName = "Carlos",
            Email = "duplicado@test.com",
            Password = "1234"
        };
        _mockService.Setup(s => s.RegisterAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Ya existe una cuenta con ese correo."));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.Register(dto));
    }
}
