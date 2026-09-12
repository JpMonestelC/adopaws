using System.Net;
using System.Net.Http.Json;
using Adopaws.Application.DTOs;
using Adopaws.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Adopaws.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptors = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<AdopawsDbContext>) ||
                d.ServiceType == typeof(DbContextOptions) ||
                d.ServiceType == typeof(AdopawsDbContext) ||
                (d.ServiceType.IsGenericType &&
                 d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
            ).ToList();

            foreach (var d in descriptors)
                services.Remove(d);

            services.AddDbContext<AdopawsDbContext>(options =>
                options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid()));
        });
    }
}

public class IntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public IntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── Auth ─────────────────────────────────────────────
    [Fact]
    public async Task Auth_RegistrarYLuegoLoguearse()
    {
        var registro = new RegisterRequestDto
        {
            FullName = "Ana Auth",
            Email = $"ana{Guid.NewGuid():N}@integration.com",
            Password = "clave-segura-123",
            UserType = "adopter"
        };

        var registerRes = await _client.PostAsJsonAsync("/api/auth/register", registro);
        Assert.Equal(HttpStatusCode.Created, registerRes.StatusCode);

        var registrado = await registerRes.Content.ReadFromJsonAsync<AuthResultDto>();
        Assert.NotNull(registrado);
        Assert.False(string.IsNullOrWhiteSpace(registrado!.Token));
        Assert.Equal(registro.Email, registrado.User.Email);

        var login = new LoginRequestDto { Email = registro.Email, Password = registro.Password };
        var loginRes = await _client.PostAsJsonAsync("/api/auth/login", login);
        Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);

        var logueado = await loginRes.Content.ReadFromJsonAsync<AuthResultDto>();
        Assert.NotNull(logueado);
        Assert.False(string.IsNullOrWhiteSpace(logueado!.Token));
    }

    [Fact]
    public async Task Auth_LoginDebeFallarConContraseñaIncorrecta()
    {
        var registro = new RegisterRequestDto
        {
            FullName = "Beto Auth",
            Email = $"beto{Guid.NewGuid():N}@integration.com",
            Password = "clave-correcta",
            UserType = "adopter"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registro);

        var login = new LoginRequestDto { Email = registro.Email, Password = "clave-incorrecta" };
        var loginRes = await _client.PostAsJsonAsync("/api/auth/login", login);

        Assert.Equal(HttpStatusCode.Unauthorized, loginRes.StatusCode);
    }

    [Fact]
    public async Task Auth_RegistrarConEmailDuplicadoDebeFallar()
    {
        var email = $"dup{Guid.NewGuid():N}@integration.com";
        var registro = new RegisterRequestDto
        {
            FullName = "Primero",
            Email = email,
            Password = "clave-123",
            UserType = "adopter"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registro);

        var segundo = new RegisterRequestDto
        {
            FullName = "Segundo",
            Email = email,
            Password = "otra-clave",
            UserType = "adopter"
        };
        var res = await _client.PostAsJsonAsync("/api/auth/register", segundo);

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Users_GetAll_NuncaDebeIncluirLaContraseña()
    {
        var registro = new RegisterRequestDto
        {
            FullName = "Sin Password Expuesta",
            Email = $"nopass{Guid.NewGuid():N}@integration.com",
            Password = "clave-123",
            UserType = "adopter"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registro);

        var raw = await _client.GetStringAsync("/api/users");

        Assert.DoesNotContain("clave-123", raw);
        Assert.DoesNotContain("\"password\"", raw, StringComparison.OrdinalIgnoreCase);
    }

    // ─── Users ────────────────────────────────────────────
    [Fact]
    public async Task Users_CrearYObtenerUsuario()
    {
        var nuevo = new CreateUserDto
        {
            FullName = "Juan Test",
            Email = "juan@integration.com",
            Password = "1234",
            UserType = "adopter",
            Phone = "88881111",
            Region = "San José",
            ProfileDescription = "",
            ProfileImage = ""
        };

        var createRes = await _client.PostAsJsonAsync("/api/users", nuevo);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var creado = await createRes.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(creado);
        Assert.Equal("Juan Test", creado.FullName);
    }

    [Fact]
    public async Task Users_ObtenerTodos()
    {
        var getRes = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
    }

    [Fact]
    public async Task Users_RetornarNotFoundSiNoExiste()
    {
        var getRes = await _client.GetAsync("/api/users/99999");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }

    // ─── Pets ─────────────────────────────────────────────
    [Fact]
    public async Task Pets_CrearYObtenerMascota()
    {
        var nuevo = new CreatePetDto
        {
            IdUser = 1,
            Name = "Firulais",
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

        var createRes = await _client.PostAsJsonAsync("/api/pets", nuevo);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var creado = await createRes.Content.ReadFromJsonAsync<PetDto>();
        Assert.NotNull(creado);
        Assert.Equal("Firulais", creado.Name);
    }

    [Fact]
    public async Task Pets_ObtenerTodos()
    {
        var getRes = await _client.GetAsync("/api/pets");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
    }

    [Fact]
    public async Task Pets_RetornarNotFoundSiNoExiste()
    {
        var getRes = await _client.GetAsync("/api/pets/99999");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }

    // ─── MarketplaceItems ─────────────────────────────────
    [Fact]
    public async Task Marketplace_CrearYObtenerItem()
    {
        var nuevo = new CreateMarketplaceItemDto
        {
            IdUser = 1,
            Title = "Collar para perro",
            Category = "Accesorios",
            Description = "Collar resistente",
            ItemCondition = "new",
            Price = 5000,
            Region = "San José",
            MainPhoto = ""
        };

        var createRes = await _client.PostAsJsonAsync("/api/marketplace-items", nuevo);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var creado = await createRes.Content.ReadFromJsonAsync<MarketplaceItemDto>();
        Assert.NotNull(creado);
        Assert.Equal("Collar para perro", creado.Title);
    }

    [Fact]
    public async Task Marketplace_ObtenerTodos()
    {
        var getRes = await _client.GetAsync("/api/marketplace-items");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
    }

    [Fact]
    public async Task Marketplace_RetornarNotFoundSiNoExiste()
    {
        var getRes = await _client.GetAsync("/api/marketplace-items/99999");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }
}