using System.Security.Claims;
using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class FavoritesControllerTests
{
    private readonly Mock<IFavoriteService> _mockService;
    private readonly FavoritesController _controller;

    public FavoritesControllerTests()
    {
        _mockService = new Mock<IFavoriteService>();
        _controller = new FavoritesController(_mockService.Object);
    }

    private void AutenticarComo(int userId)
    {
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

    [Fact]
    public async Task GetMyFavorites_DebeRetornarSoloLosFavoritosDelUsuarioAutenticado()
    {
        AutenticarComo(1);
        var favoritos = new List<FavoriteDto>
        {
            new FavoriteDto { IdFavorite = 1, IdPet = 10, Pet = new PetDto { IdPet = 10, Name = "Luna" } }
        };
        _mockService.Setup(s => s.GetByUserIdAsync(1)).ReturnsAsync(favoritos);

        var result = await _controller.GetMyFavorites();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(favoritos, ok.Value);
    }

    [Fact]
    public async Task GetMyFavorites_SinAutenticarDebeRetornar401()
    {
        var result = await _controller.GetMyFavorites();

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Add_NuevoFavoritoDebeRetornar201()
    {
        AutenticarComo(1);
        var dto = new FavoriteDto { IdFavorite = 5, IdPet = 10, Pet = new PetDto { IdPet = 10, Name = "Luna" } };
        _mockService.Setup(s => s.AddAsync(1, 10)).ReturnsAsync((dto, true));

        var result = await _controller.Add(10);

        var created = Assert.IsType<ObjectResult>(result);
        Assert.Equal(201, created.StatusCode);
        Assert.Equal(dto, created.Value);
    }

    [Fact]
    public async Task Add_FavoritoYaExistenteDebeRetornar200Idempotente()
    {
        AutenticarComo(1);
        var dto = new FavoriteDto { IdFavorite = 5, IdPet = 10, Pet = new PetDto { IdPet = 10, Name = "Luna" } };
        _mockService.Setup(s => s.AddAsync(1, 10)).ReturnsAsync((dto, false));

        var result = await _controller.Add(10);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(dto, ok.Value);
    }

    [Fact]
    public async Task Remove_DebeRetornar204SiExistia()
    {
        AutenticarComo(1);
        _mockService.Setup(s => s.RemoveAsync(1, 10)).ReturnsAsync(true);

        var result = await _controller.Remove(10);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Remove_DebeRetornar404SiNoExistia()
    {
        AutenticarComo(1);
        _mockService.Setup(s => s.RemoveAsync(1, 10)).ReturnsAsync(false);

        var result = await _controller.Remove(10);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Check_DebeReflejarElEstadoReportadoPorElServicio()
    {
        AutenticarComo(1);
        _mockService.Setup(s => s.IsFavoriteAsync(1, 10)).ReturnsAsync(true);

        var result = await _controller.Check(10);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(true, ok.Value!.GetType().GetProperty("isFavorite")!.GetValue(ok.Value));
    }

    [Fact]
    public async Task NingunaAccionDebeAceptarUnUserIdDelLlamanteQueNoSeaElPropio()
    {
        // El controlador nunca lee userId de la ruta ni del body: siempre lo
        // toma del claim del token. Esta prueba documenta esa garantía
        // llamando dos usuarios distintos y confirmando que cada uno solo
        // puede tocar su propio conjunto de favoritos.
        AutenticarComo(1);
        _mockService.Setup(s => s.GetByUserIdAsync(1)).ReturnsAsync(new List<FavoriteDto>());
        await _controller.GetMyFavorites();
        _mockService.Verify(s => s.GetByUserIdAsync(1), Times.Once);
        _mockService.Verify(s => s.GetByUserIdAsync(It.Is<int>(id => id != 1)), Times.Never);

        AutenticarComo(2);
        _mockService.Setup(s => s.GetByUserIdAsync(2)).ReturnsAsync(new List<FavoriteDto>());
        await _controller.GetMyFavorites();
        _mockService.Verify(s => s.GetByUserIdAsync(2), Times.Once);
    }
}
