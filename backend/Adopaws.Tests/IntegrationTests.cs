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
            // EF Core's AddDbContext registers more than just DbContextOptions<T> —
            // newer versions also add an internal IDbContextOptionsConfiguration<T>
            // (not a public type we can reference directly) that still carries the
            // original UseSqlServer(...) call from AddInfrastructure(). Removing only
            // DbContextOptions<AdopawsDbContext> leaves that internal registration
            // behind, so at runtime BOTH the SqlServer and the InMemory provider end
            // up configured on the same DbContext, which EF Core rejects with
            // "Services for database providers ... have been registered". Matching by
            // FullName instead of a fixed list of types removes every registration
            // that mentions AdopawsDbContext, public or internal, so no leftover
            // provider configuration survives the swap.
            var descriptors = services.Where(d =>
                d.ServiceType == typeof(AdopawsDbContext) ||
                (d.ServiceType.FullName?.Contains(nameof(AdopawsDbContext)) ?? false)
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

    /// <summary>Registra un usuario nuevo (email único) y devuelve su JWT, para
    /// las pruebas que ejercen rutas protegidas con [Authorize].</summary>
    private async Task<(string Token, int IdUser)> RegisterAndGetTokenAsync(string userType = "adopter")
    {
        var registro = new RegisterRequestDto
        {
            FullName = "Usuario de Prueba",
            Email = $"auth{Guid.NewGuid():N}@integration.com",
            Password = "clave-segura-123",
            UserType = userType
        };

        var res = await _client.PostAsJsonAsync("/api/auth/register", registro);
        res.EnsureSuccessStatusCode();

        var result = await res.Content.ReadFromJsonAsync<AuthResultDto>();
        Assert.NotNull(result);
        return (result!.Token, result.User.IdUser);
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
        var (token, _) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var raw = await _client.GetStringAsync("/api/users");

        Assert.DoesNotContain("clave-segura-123", raw);
        Assert.DoesNotContain("\"password\"", raw, StringComparison.OrdinalIgnoreCase);
    }

    // ─── Users ────────────────────────────────────────────
    [Fact]
    public async Task Users_CrearYObtenerUsuario()
    {
        var nuevo = new CreateUserDto
        {
            FullName = "Juan Test",
            Email = $"juan{Guid.NewGuid():N}@integration.com",
            Password = "clave-123",
            UserType = "adopter",
            Phone = "88881111",
            Region = "San José",
            ProfileDescription = "",
            ProfileImage = ""
        };

        // POST /api/users se mantiene anónimo: es un registro alterno (ver UsersController).
        var createRes = await _client.PostAsJsonAsync("/api/users", nuevo);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var creado = await createRes.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(creado);
        Assert.Equal("Juan Test", creado.FullName);
    }

    [Fact]
    public async Task Users_GetAll_SinTokenDebeRetornar401()
    {
        var getRes = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, getRes.StatusCode);
    }

    [Fact]
    public async Task Users_ObtenerTodos()
    {
        var (token, _) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var getRes = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
    }

    [Fact]
    public async Task Users_RetornarNotFoundSiNoExiste()
    {
        var (token, _) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var getRes = await _client.GetAsync("/api/users/999999");
        Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
    }

    [Fact]
    public async Task Users_Update_OtroUsuarioDebeRetornar403()
    {
        var (tokenA, _) = await RegisterAndGetTokenAsync();
        var (_, idUserB) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenA);

        var dto = new UpdateUserDto { FullName = "Intento ajeno", Status = "Active" };
        var res = await _client.PutAsJsonAsync($"/api/users/{idUserB}", dto);

        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    // ─── Pets ─────────────────────────────────────────────
    [Fact]
    public async Task Pets_CrearYObtenerMascota()
    {
        var (token, idUser) = await RegisterAndGetTokenAsync("shelter");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var nuevo = new CreatePetDto
        {
            IdUser = idUser,
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
        // El dueño real es el del JWT, no el que venía en el dto (aquí coinciden a propósito).
        Assert.Equal(idUser, creado.IdUser);
    }

    [Fact]
    public async Task Pets_Crear_SinTokenDebeRetornar401()
    {
        var nuevo = new CreatePetDto { Name = "Anonimo", PetType = "dog" };
        var res = await _client.PostAsJsonAsync("/api/pets", nuevo);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
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
        var (token, idUser) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var nuevo = new CreateMarketplaceItemDto
        {
            IdUser = idUser,
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
        Assert.Equal(idUser, creado.IdUser);
    }

    [Fact]
    public async Task Marketplace_Crear_SinTokenDebeRetornar401()
    {
        var nuevo = new CreateMarketplaceItemDto { Title = "Anonimo", Price = 100 };
        var res = await _client.PostAsJsonAsync("/api/marketplace-items", nuevo);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
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

    // ─── Favorites (nuevo) ────────────────────────────────
    [Fact]
    public async Task Favorites_AgregarConsultarYQuitar()
    {
        var (shelterToken, shelterId) = await RegisterAndGetTokenAsync("shelter");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", shelterToken);
        var pet = await _client.PostAsJsonAsync("/api/pets", new CreatePetDto { Name = "Luna", PetType = "cat", IdUser = shelterId });
        var petCreado = await pet.Content.ReadFromJsonAsync<PetDto>();
        Assert.NotNull(petCreado);

        var (adopterToken, _) = await RegisterAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adopterToken);

        var add = await _client.PostAsync($"/api/favorites/{petCreado!.IdPet}", new StringContent(string.Empty));
        Assert.Equal(HttpStatusCode.Created, add.StatusCode);

        var list = await _client.GetFromJsonAsync<List<FavoriteDto>>("/api/favorites");
        Assert.NotNull(list);
        Assert.Contains(list!, f => f.IdPet == petCreado.IdPet);

        var remove = await _client.DeleteAsync($"/api/favorites/{petCreado.IdPet}");
        Assert.Equal(HttpStatusCode.NoContent, remove.StatusCode);
    }

    [Fact]
    public async Task Favorites_SinTokenDebeRetornar401()
    {
        var res = await _client.GetAsync("/api/favorites");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // ─── Shelters (nuevo) ─────────────────────────────────
    [Fact]
    public async Task Shelters_ListaEsPublicaYSoloIncluyeRefugios()
    {
        var (shelterToken, shelterId) = await RegisterAndGetTokenAsync("shelter");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", shelterToken);
        // Un registro de tipo "shelter" ya existe (el de arriba); no necesita token para listarse.
        _client.DefaultRequestHeaders.Authorization = null;

        var shelters = await _client.GetFromJsonAsync<List<UserDto>>("/api/shelters");
        Assert.NotNull(shelters);
        Assert.Contains(shelters!, s => s.IdUser == shelterId);
        Assert.All(shelters!, s => Assert.Equal("shelter", s.UserType, ignoreCase: true));
    }

    [Fact]
    public async Task Shelters_GetByIdConUsuarioNoRefugioDebeRetornar404()
    {
        var (_, adopterId) = await RegisterAndGetTokenAsync("adopter");

        var res = await _client.GetAsync($"/api/shelters/{adopterId}");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }
}