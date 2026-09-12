using Adopaws.Api.Extensions;
using Adopaws.Api.Middlewares;
using Adopaws.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddSwaggerConfiguration();
builder.Services.AddEndpointsApiExplorer();

// Infrastructure (DbContext + Repositories + Services)
builder.Services.AddInfrastructure(builder.Configuration);

// JWT authentication (see Adopaws.Application.Services.AuthService for token issuance)
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS — configure as needed
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Global error handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger UI (all environments for now; restrict in production)
app.UseSwaggerConfiguration();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposes the implicit top-level-statements Program class to Adopaws.Tests,
// which needs it for WebApplicationFactory<Program> (see IntegrationTests.cs).
// Without this, Program is internal and the test assembly can't reference it.
public partial class Program { }
