using Adopaws.Domain.Entities;
using Adopaws.Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;

namespace Adopaws.Infrastructure.Persistence;

public class AdopawsDbContext : DbContext
{
    public AdopawsDbContext(DbContextOptions<AdopawsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<PetPhoto> PetPhotos => Set<PetPhoto>();
    public DbSet<AdoptionRequest> AdoptionRequests => Set<AdoptionRequest>();
    public DbSet<MarketplaceItem> MarketplaceItems => Set<MarketplaceItem>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<ConsultationResponse> ConsultationResponses => Set<ConsultationResponse>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new PetConfiguration());
        modelBuilder.ApplyConfiguration(new PetPhotoConfiguration());
        modelBuilder.ApplyConfiguration(new AdoptionRequestConfiguration());
        modelBuilder.ApplyConfiguration(new MarketplaceItemConfiguration());
        modelBuilder.ApplyConfiguration(new ConsultationConfiguration());
        modelBuilder.ApplyConfiguration(new ConsultationResponseConfiguration());
    }
}
