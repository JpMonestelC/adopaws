using Adopaws.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Adopaws.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.IdUser);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(150);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.Password).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Phone).HasMaxLength(30);
        builder.Property(u => u.Region).HasMaxLength(100);
        builder.Property(u => u.UserType).IsRequired().HasMaxLength(50);
        builder.Property(u => u.Status).IsRequired().HasMaxLength(50);
        builder.Property(u => u.RegistrationDate).IsRequired();
    }
}

public class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> builder)
    {
        builder.HasKey(p => p.IdPet);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.PetType).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Breed).HasMaxLength(100);
        builder.Property(p => p.Gender).HasMaxLength(20);
        builder.Property(p => p.Size).HasMaxLength(30);
        builder.Property(p => p.PublicationStatus).IsRequired().HasMaxLength(50);

        builder.HasOne(p => p.User)
               .WithMany(u => u.Pets)
               .HasForeignKey(p => p.IdUser)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PetPhotoConfiguration : IEntityTypeConfiguration<PetPhoto>
{
    public void Configure(EntityTypeBuilder<PetPhoto> builder)
    {
        builder.HasKey(p => p.IdPetPhoto);
        builder.Property(p => p.PhotoUrl).IsRequired().HasMaxLength(500);

        builder.HasOne(p => p.Pet)
               .WithMany(pet => pet.PetPhotos)
               .HasForeignKey(p => p.IdPet)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AdoptionRequestConfiguration : IEntityTypeConfiguration<AdoptionRequest>
{
    public void Configure(EntityTypeBuilder<AdoptionRequest> builder)
    {
        builder.HasKey(r => r.IdAdoptionRequest);
        builder.Property(r => r.RequestStatus).IsRequired().HasMaxLength(50);
        builder.Property(r => r.HousingType).HasMaxLength(100);
        builder.Property(r => r.ContactPhone).HasMaxLength(30);

        // Unique constraint: one request per user per pet
        builder.HasIndex(r => new { r.IdPet, r.IdUser }).IsUnique();

        builder.HasOne(r => r.Pet)
               .WithMany(p => p.AdoptionRequests)
               .HasForeignKey(r => r.IdPet)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
               .WithMany(u => u.AdoptionRequests)
               .HasForeignKey(r => r.IdUser)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class MarketplaceItemConfiguration : IEntityTypeConfiguration<MarketplaceItem>
{
    public void Configure(EntityTypeBuilder<MarketplaceItem> builder)
    {
        builder.HasKey(m => m.IdMarketplaceItem);
        builder.Property(m => m.Title).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Category).HasMaxLength(100);
        builder.Property(m => m.ItemCondition).HasMaxLength(50);
        builder.Property(m => m.Price).HasColumnType("decimal(18,2)");
        builder.Property(m => m.Region).HasMaxLength(100);
        builder.Property(m => m.MainPhoto).HasMaxLength(500);
        builder.Property(m => m.PublicationStatus).IsRequired().HasMaxLength(50);

        builder.HasOne(m => m.User)
               .WithMany(u => u.MarketplaceItems)
               .HasForeignKey(m => m.IdUser)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ConsultationConfiguration : IEntityTypeConfiguration<Consultation>
{
    public void Configure(EntityTypeBuilder<Consultation> builder)
    {
        builder.HasKey(c => c.IdConsultation);
        builder.Property(c => c.Subject).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Message).IsRequired();
        builder.Property(c => c.ConsultationStatus).IsRequired().HasMaxLength(50);

        builder.HasOne(c => c.Sender)
               .WithMany(u => u.SentConsultations)
               .HasForeignKey(c => c.SenderIdUser)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Receiver)
               .WithMany(u => u.ReceivedConsultations)
               .HasForeignKey(c => c.ReceiverIdUser)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

public class ConsultationResponseConfiguration : IEntityTypeConfiguration<ConsultationResponse>
{
    public void Configure(EntityTypeBuilder<ConsultationResponse> builder)
    {
        builder.HasKey(r => r.IdConsultationResponse);
        builder.Property(r => r.ResponseMessage).IsRequired();

        builder.HasOne(r => r.Consultation)
               .WithMany(c => c.Responses)
               .HasForeignKey(r => r.IdConsultation)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.User)
               .WithMany(u => u.ConsultationResponses)
               .HasForeignKey(r => r.IdUser)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
