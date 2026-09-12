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

| Controller | Route | Methods |
|---|---|---|
| Auth | `/api/auth/login` | POST — validates credentials, returns `{ token, expiresAtUtc, user }` |
| Auth | `/api/auth/register` | POST — creates the account (hashed password) and returns `{ token, expiresAtUtc, user }` |
| Compatibility | `/api/compatibility/{userId}/{petId}` | GET — score + explanation for one user/pet pair |
| Compatibility | `/api/compatibility/recommendations/{userId}?topN=` | GET — ranked pet recommendations for a user |
| Users | `/api/users` | GET, POST |
| Users | `/api/users/{id}` | GET, PUT, DELETE |
| Pets | `/api/pets` | GET, POST |
| Pets | `/api/pets/{id}` | GET, PUT, DELETE |
| PetPhotos | `/api/pet-photos/by-pet/{petId}` | GET |
| PetPhotos | `/api/pet-photos` | POST |
| PetPhotos | `/api/pet-photos/{id}` | DELETE |
| AdoptionRequests | `/api/adoption-requests/{id}` | GET |
| AdoptionRequests | `/api/adoption-requests/by-pet/{petId}` | GET |
| AdoptionRequests | `/api/adoption-requests/by-user/{userId}` | GET |
| AdoptionRequests | `/api/adoption-requests` | POST |
| AdoptionRequests | `/api/adoption-requests/{id}/status` | PATCH |
| AdoptionRequests | `/api/adoption-requests/{id}` | DELETE |
| MarketplaceItems | `/api/marketplace-items` | GET, POST |
| MarketplaceItems | `/api/marketplace-items/{id}` | GET, PUT, DELETE |
| Consultations | `/api/consultations/{id}` | GET |
| Consultations | `/api/consultations/by-sender/{senderUserId}` | GET |
| Consultations | `/api/consultations/by-receiver/{receiverUserId}` | GET |
| Consultations | `/api/consultations` | POST |
| Consultations | `/api/consultations/{id}/status` | PATCH |
| ConsultationResponses | `/api/consultation-responses/by-consultation/{consultationId}` | GET |
| ConsultationResponses | `/api/consultation-responses` | POST |

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

### Authentication
- `POST /api/auth/register` and `POST /api/auth/login` (`AuthController` → `AuthService`) hash passwords with BCrypt (`PasswordHasher` in `Adopaws.Infrastructure/Security`) and issue a signed JWT (`System.IdentityModel.Tokens.Jwt`), using the `Jwt` section in `appsettings.json`.
- `Program.cs` wires `AddJwtAuthentication` + `UseAuthentication()`/`UseAuthorization()`, and Swagger is configured with a Bearer token security definition so tokens can be tested directly from Swagger UI.
- **Not yet done:** no controller has `[Authorize]` applied, so every endpoint is still publicly reachable even though a valid token can be obtained. Protecting routes (e.g. `AdoptionRequests`, `Users` write endpoints) with `[Authorize]`/role checks is the natural next step.
- **Before deploying anywhere real:** replace the placeholder `Jwt:Key` in `appsettings.json` with a real secret (e.g. from environment variables or a secrets manager) — the committed value is intentionally a placeholder, not a usable key.
- `UserDto` no longer exposes `Password` (it used to, over `GET /api/users`) — passwords never leave the backend in a response body; see `Adopaws.Tests/IntegrationTests.cs::Users_GetAll_NuncaDebeIncluirLaContraseña`.

---

## Running the Tests

```bash
dotnet test
```

`Adopaws.Tests` covers controller logic with mocked repositories (Moq), the BCrypt password hasher in isolation, and real end-to-end HTTP flows (register → login → protected-shape checks) against an in-memory EF Core database via `WebApplicationFactory<Program>`.

---

## Next Steps

1. **Protect routes with `[Authorize]`** — JWT issuance exists end-to-end (see Authentication above), but no controller actually requires the token yet.
2. **Add input validation** — Add FluentValidation or DataAnnotations to DTOs.
3. **Add pagination** — Wrap list responses in `PagedResult<T>`.
4. **Add filtering** — Query parameters on `/api/pets`, `/api/marketplace-items`, etc.
5. **Replace the placeholder `Jwt:Key`** with a real secret sourced from environment variables or a secrets manager before any real deployment.
