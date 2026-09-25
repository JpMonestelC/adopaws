# Adopaws — Backend Foundation

A modular monolith backend for the **Adopaws** platform, supporting pet adoption, a marketplace for pet-related items, and veterinarian/association consultations.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | .NET 10 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 10 |
| Database | SQL Server |
| Auth | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) + BCrypt password hashing (`BCrypt.Net-Next`) |
| API Docs | Swagger / OpenAPI (Swashbuckle) |
| Testing | xUnit + Moq (unit/controller) + `WebApplicationFactory` w/ EF Core InMemory (integration) — `Adopaws.Tests` |
| Architecture | Modular Monolith — Layered / Clean Architecture |

---

## Solution Structure

```
Adopaws.sln
│
├── Adopaws.Api                   # Presentation layer
│   ├── Controllers/              # Thin REST controllers
│   ├── Middlewares/              # Global exception handling
│   ├── Extensions/               # Swagger & service registration helpers
│   ├── appsettings.json
│   └── Program.cs
│
├── Adopaws.Application           # Business logic layer
│   ├── DTOs/                     # Request/response models
│   ├── Interfaces/               # Repository & service contracts
│   ├── Services/                 # Use-case implementations
│   └── Mappings/                 # Entity ↔ DTO mappers
│
├── Adopaws.Domain                # Core domain layer (no dependencies)
│   └── Entities/                 # Clean entity classes
│
├── Adopaws.Infrastructure        # Data access layer
│   ├── Persistence/              # AdopawsDbContext
│   ├── Configurations/           # Fluent API entity configurations
│   ├── Repositories/             # EF Core repository implementations
│   ├── Security/                 # PasswordHasher (BCrypt)
│   └── DependencyInjection/      # IServiceCollection extensions
│
└── Adopaws.Tests                 # xUnit test project
    ├── *ControllerTests.cs       # Controller unit tests (Moq)
    ├── PasswordHasherTests.cs    # Hasher unit tests
    └── IntegrationTests.cs       # End-to-end tests via WebApplicationFactory + EF Core InMemory
```

---

## Domain Model

### Entities & Relationships

```
Users ──────< Pets ──────< PetPhotos
  │               └──────< AdoptionRequests >──── Users
  ├──────────< MarketplaceItems
  ├──────────< Consultations (as Sender)
  ├──────────< Consultations (as Receiver)
  └──────────< ConsultationResponses

Consultations ──────< ConsultationResponses
```

### Key Constraints
- `AdoptionRequests`: unique constraint on `(IdPet, IdUser)` — one request per user per pet.
- `Users.Email`: unique index.

---

## API Endpoints

🔓 = público (`[AllowAnonymous]`) · 🔒 = requiere JWT (`[Authorize]`) · 🔒👤 = requiere JWT **y** que el recurso pertenezca al usuario del token (si no, `403 Forbidden`)

| Controller | Route | Methods | Auth |
|---|---|---|---|
| Auth | `/api/auth/login` | POST — validates credentials, returns `{ token, expiresAtUtc, user }` | 🔓 |
| Auth | `/api/auth/register` | POST — creates the account (hashed password) and returns `{ token, expiresAtUtc, user }` | 🔓 |
| Compatibility | `/api/compatibility/{userId}/{petId}` | GET — score + explanation for one user/pet pair | 🔒👤 (`userId` debe ser el del token) |
| Compatibility | `/api/compatibility/recommendations/{userId}?topN=` | GET — ranked pet recommendations for a user | 🔒👤 |
| Users | `/api/users` | GET | 🔒 |
| Users | `/api/users/{id}` | GET | 🔒 |
| Users | `/api/users` | POST | 🔓 (registro alternativo — casos de uso legacy/administrativos; el registro normal es `/api/auth/register`) |
| Users | `/api/users/{id}` | PUT, DELETE | 🔒👤 |
| Pets | `/api/pets` | GET | 🔓 |
| Pets | `/api/pets/{id}` | GET | 🔓 |
| Pets | `/api/pets` | POST | 🔒 (el `IdUser` propietario se toma del token, se ignora cualquier valor recibido en el body) |
| Pets | `/api/pets/{id}` | PUT, DELETE | 🔒👤 |
| PetPhotos | `/api/pet-photos/by-pet/{petId}` | GET | 🔓 |
| PetPhotos | `/api/pet-photos` | POST | 🔒👤 (solo el dueño de la mascota puede agregar fotos) |
| PetPhotos | `/api/pet-photos/{id}` | DELETE | 🔒👤 (solo el dueño de la mascota) |
| AdoptionRequests | `/api/adoption-requests/{id}` | GET | 🔒 |
| AdoptionRequests | `/api/adoption-requests/by-pet/{petId}` | GET | 🔒 |
| AdoptionRequests | `/api/adoption-requests/by-user/{userId}` | GET | 🔒👤 |
| AdoptionRequests | `/api/adoption-requests` | POST | 🔒 (el `IdUser` solicitante se toma del token) |
| AdoptionRequests | `/api/adoption-requests/{id}/status` | PATCH | 🔒👤 (solo el dueño de la mascota puede cambiar el estado) |
| AdoptionRequests | `/api/adoption-requests/{id}` | DELETE | 🔒👤 (solo quien creó la solicitud) |
| MarketplaceItems | `/api/marketplace-items` | GET | 🔓 |
| MarketplaceItems | `/api/marketplace-items/{id}` | GET | 🔓 |
| MarketplaceItems | `/api/marketplace-items` | POST | 🔒 (el `IdUser` vendedor se toma del token) |
| MarketplaceItems | `/api/marketplace-items/{id}` | PUT, DELETE | 🔒👤 |
| Consultations | `/api/consultations/{id}` | GET | 🔒 |
| Consultations | `/api/consultations/by-sender/{senderUserId}` | GET | 🔒👤 |
| Consultations | `/api/consultations/by-receiver/{receiverUserId}` | GET | 🔒👤 |
| Consultations | `/api/consultations` | POST | 🔒 (el `SenderIdUser` se toma del token) |
| Consultations | `/api/consultations/{id}/status` | PATCH | 🔒👤 (solo el receptor puede cambiar el estado) |
| ConsultationResponses | `/api/consultation-responses/by-consultation/{consultationId}` | GET | 🔒 |
| ConsultationResponses | `/api/consultation-responses` | POST | 🔒 (el `IdUser` autor se toma del token; solo participantes de la consulta) |
| **Favorites** | `/api/favorites` | GET — lista los favoritos del usuario autenticado, con la mascota embebida | 🔒 |
| **Favorites** | `/api/favorites/check/{petId}` | GET — `{ isFavorite: bool }` | 🔒 |
| **Favorites** | `/api/favorites/{petId}` | POST — agrega a favoritos (idempotente: `201` si es nuevo, `200` si ya existía) | 🔒 |
| **Favorites** | `/api/favorites/{petId}` | DELETE — quita de favoritos (`204`, `404` si no existía) | 🔒 |
| **Shelters** | `/api/shelters` | GET — lista usuarios con `userType == "shelter"` | 🔓 |
| **Shelters** | `/api/shelters/{id}` | GET — `404` si el id no corresponde a un refugio | 🔓 |
| **Shelters** | `/api/shelters/{id}/pets` | GET — mascotas publicadas por ese refugio | 🔓 |

`Favorites` y `Shelters` son endpoints reales (antes eran simulados en el frontend — ver el README raíz para el detalle). `Favorites` nunca acepta un `userId` desde el cliente: siempre se deriva del JWT, así que un usuario no puede leer ni modificar los favoritos de otro. `Shelters` reutiliza la tabla `Users` filtrada server-side por `userType`, sin exponer la lista completa de usuarios (que ahora requiere `[Authorize]`).

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- SQL Server (local or remote)
- EF Core CLI tools

### 1. Install EF Core CLI Tools

```bash
dotnet tool install --global dotnet-ef
```

### 2. Configure the Connection String

Edit `Adopaws.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=AdopawsDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Adjust `Server=.` to your SQL Server instance if needed (e.g., `Server=localhost,1433`).

### 3. Run EF Core Migrations

From the **solution root** (where `Adopaws.sln` lives):

```bash
# Create the initial migration
dotnet ef migrations add InitialCreate \
  --project Adopaws.Infrastructure \
  --startup-project Adopaws.Api

# Apply the migration to create AdopawsDB
dotnet ef database update \
  --project Adopaws.Infrastructure \
  --startup-project Adopaws.Api
```

### 4. Run the API

```bash
cd Adopaws.Api
dotnet run
```

Swagger UI will be available at: **http://localhost:5000/** (port fixed via `Adopaws.Api/Properties/launchSettings.json`, matching the frontend's default `VITE_API_URL`).

---

## Design Decisions

### Architecture
- **Modular Monolith / Layered Architecture** — Domain has zero external dependencies. Application depends only on Domain. Infrastructure implements Application contracts. API depends on Application and Infrastructure.
- **Thin Controllers** — Controllers only validate input and delegate to services; all business logic lives in the Application layer.
- **Repository Pattern** — Repositories are defined as interfaces in Application and implemented in Infrastructure, keeping the Application layer database-agnostic.

### Error Handling
- Global `ExceptionHandlingMiddleware` catches all unhandled exceptions and returns consistent JSON error responses with `statusCode`, `message`, and `timestamp`.

### Dependency Injection
- All registrations are encapsulated in `InfrastructureServiceExtensions.AddInfrastructure()` to keep `Program.cs` clean.

### Authentication & Authorization
- `POST /api/auth/register` and `POST /api/auth/login` (`AuthController` → `AuthService`) hash passwords with BCrypt (`PasswordHasher` in `Adopaws.Infrastructure/Security`) and issue a signed JWT (`System.IdentityModel.Tokens.Jwt`), using the `Jwt` section in `appsettings.json`. The JWT carries the user's id (`sub` + `ClaimTypes.NameIdentifier`) and `userType` (`ClaimTypes.Role`).
- `Program.cs` wires `AddJwtAuthentication` + `UseAuthentication()`/`UseAuthorization()`, and Swagger is configured with a Bearer token security definition so tokens can be tested directly from Swagger UI.
- **Routes are now protected.** Every controller except `Auth`, the public read routes on `Pets`/`MarketplaceItems`/`PetPhotos`/`Shelters`, and the legacy `POST /api/users` requires a valid Bearer token (`[Authorize]`). See the table above for the exact scheme per route.
- **Ownership is enforced, not trusted.** For any write action tied to a specific user (editing your own profile, your own pet, your own marketplace item; adding a pet photo; responding to your own consultation; adding/removing your own favorites), the id is taken from `ClaimsPrincipal.GetUserId()` (`Adopaws.Api/Extensions/ClaimsPrincipalExtensions.cs`) — never from the request body or route — and any mismatch between the token's user and the resource's actual owner returns `403 Forbidden`, not a silent overwrite of someone else's data. This is exercised by dedicated unit tests (`*ControllerTests.cs`) and integration tests (`IntegrationTests.cs`, e.g. `Users_Update_OtroUsuarioDebeRetornar403`).
- **Before deploying anywhere real:** replace the placeholder `Jwt:Key` in `appsettings.json` with a real secret (e.g. from environment variables or a secrets manager) — the committed value is intentionally a placeholder, not a usable key.
- `UserDto` no longer exposes `Password` (it used to, over `GET /api/users`) — passwords never leave the backend in a response body; see `Adopaws.Tests/IntegrationTests.cs::Users_GetAll_NuncaDebeIncluirLaContraseña`.

### Input Validation
- Every request DTO (`Adopaws.Application/DTOs/*.cs`) now carries `System.ComponentModel.DataAnnotations` attributes — `[Required]`, `[EmailAddress]`, `[MinLength]`/`[StringLength]`, `[Range]`, etc. — instead of accepting anything the client sends.
- `[ApiController]` triggers ASP.NET Core's automatic model validation, so an invalid payload gets a `400 Bad Request` with the validation errors before the request ever reaches a controller action or service — no extra wiring needed in `Program.cs`.
- DTO fields that represent ownership (`IdUser`, `SenderIdUser`, etc.) are annotated in comments as "ignored/overwritten server-side" — validation does not replace the ownership derivation described above, the two are independent layers.

---

## Running the Tests

```bash
dotnet test
```

`Adopaws.Tests` covers controller logic with mocked repositories (Moq), the BCrypt password hasher in isolation, and real end-to-end HTTP flows (register → login → protected-shape checks) against an in-memory EF Core database via `WebApplicationFactory<Program>`.

---

## Next Steps

1. **Add pagination** — Wrap list responses in `PagedResult<T>`.
2. **Add filtering** — Query parameters on `/api/pets`, `/api/marketplace-items`, etc.
3. **Replace the placeholder `Jwt:Key`** with a real secret sourced from environment variables or a secrets manager before any real deployment.
4. **Run a full `dotnet build`/`dotnet test`** on a machine with normal NuGet access — this repo's authorization, validation, and `Favorites` feature (including its hand-written EF Core migration, `20260925120000_AddFavorites`) were built and cross-checked without a working .NET compiler available in the restoration environment (no NuGet access), so a real compile + `dotnet ef database update` should be the first thing done before relying on this in production.

Done this round (see `Authentication & Authorization` and `Input Validation` above for detail): `[Authorize]` + ownership checks across every controller, DataAnnotations validation on every DTO, and two new real endpoints — `Favorites` and `Shelters` — replacing what used to be simulated entirely in the frontend.
