using Adopaws.Api.Controllers;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Adopaws.Tests;

public class MarketplaceItemsControllerTests
{
    private readonly Mock<IMarketplaceItemService> _mockService;
    private readonly MarketplaceItemsController _controller;

    public MarketplaceItemsControllerTests()
    {
        _mockService = new Mock<IMarketplaceItemService>();
        _controller = new MarketplaceItemsController(_mockService.Object);
    }

    // ─── GetAll ───────────────────────────────────────────
    [Fact]
    public async Task GetAll_DebeRetornarListaDeItems()
    {
        var items = new List<MarketplaceItemDto>
        {
            new MarketplaceItemDto { IdMarketplaceItem = 1, Title = "Collar", Price = 5000 },
            new MarketplaceItemDto { IdMarketplaceItem = 2, Title = "Cama", Price = 12000 }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(items);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(items, ok.Value);
    }

    [Fact]
    public async Task GetAll_DebeRetornarListaVacia()
    {
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<MarketplaceItemDto>());

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<MarketplaceItemDto>>(ok.Value);
        Assert.Empty(lista);
    }

    // ─── GetById ──────────────────────────────────────────
    [Fact]
    public async Task GetById_DebeRetornarItemExistente()
    {
        var item = new MarketplaceItemDto { IdMarketplaceItem = 1, Title = "Collar", Price = 5000 };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(item);

        var result = await _controller.GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(item, ok.Value);
    }

    [Fact]
    public async Task GetById_DebeRetornar404SiNoExiste()
    {
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((MarketplaceItemDto?)null);

        var result = await _controller.GetById(999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Create ───────────────────────────────────────────
    [Fact]
    public async Task Create_DebeCrearItemCorrectamente()
    {
        var dto = new CreateMarketplaceItemDto
        {
            IdUser = 1,
            Title = "Juguete",
            Price = 3500,
            Region = "San José"
        };
        var creado = new MarketplaceItemDto { IdMarketplaceItem = 3, Title = "Juguete", Price = 3500 };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(creado);

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(creado, created.Value);
    }

    // ─── Update ───────────────────────────────────────────
    [Fact]
    public async Task Update_DebeActualizarItemCorrectamente()
    {
        var dto = new UpdateMarketplaceItemDto { Title = "Juguete Actualizado", Price = 4000, PublicationStatus = "Active" };
        var actualizado = new MarketplaceItemDto { IdMarketplaceItem = 1, Title = "Juguete Actualizado", Price = 4000 };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(actualizado);

        var result = await _controller.Update(1, dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(actualizado, ok.Value);
    }

    [Fact]
    public async Task Update_DebeRetornar404SiNoExiste()
    {
        var dto = new UpdateMarketplaceItemDto { Title = "X", PublicationStatus = "Active" };
        _mockService.Setup(s => s.UpdateAsync(999, dto)).ReturnsAsync((MarketplaceItemDto?)null);

        var result = await _controller.Update(999, dto);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Delete ───────────────────────────────────────────
    [Fact]
    public async Task Delete_DebeEliminarItemCorrectamente()
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
    public async Task Create_DebeRetornarErrorSiDatosInvalidos()
    {
        var dto = new CreateMarketplaceItemDto { Title = "", Price = 0 };
        _mockService.Setup(s => s.CreateAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Datos inválidos"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.Create(dto));
    }

    [Fact]
    public async Task GetById_DebeRetornar404ConIdInvalido()
    {
        _mockService.Setup(s => s.GetByIdAsync(0)).ReturnsAsync((MarketplaceItemDto?)null);

        var result = await _controller.GetById(0);

        Assert.IsType<NotFoundResult>(result);
    }
}