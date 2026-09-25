using Adopaws.Application.Interfaces;
using Adopaws.Application.Services;
using Adopaws.Infrastructure.Persistence;
using Adopaws.Infrastructure.Repositories;
using Adopaws.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Adopaws.Infrastructure.DependencyInjection;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<AdopawsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPetRepository, PetRepository>();
        services.AddScoped<IPetPhotoRepository, PetPhotoRepository>();
        services.AddScoped<IAdoptionRequestRepository, AdoptionRequestRepository>();
        services.AddScoped<IMarketplaceItemRepository, MarketplaceItemRepository>();
        services.AddScoped<IConsultationRepository, ConsultationRepository>();
        services.AddScoped<IConsultationResponseRepository, ConsultationResponseRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();

        // Security
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPetService, PetService>();
        services.AddScoped<IPetPhotoService, PetPhotoService>();
        services.AddScoped<IAdoptionRequestService, AdoptionRequestService>();
        services.AddScoped<IMarketplaceItemService, MarketplaceItemService>();
        services.AddScoped<IConsultationService, ConsultationService>();
        services.AddScoped<IConsultationResponseService, ConsultationResponseService>();
        services.AddScoped<IFavoriteService, FavoriteService>();

        // AI Compatibility
        services.AddHttpClient("AnthropicClient");
        services.AddScoped<ICompatibilityService, CompatibilityService>();

        return services;
    }
}
