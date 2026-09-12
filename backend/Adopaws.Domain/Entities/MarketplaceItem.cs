namespace Adopaws.Domain.Entities;

public class MarketplaceItem
{
    public int IdMarketplaceItem { get; set; }
    public int IdUser { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? ItemCondition { get; set; }
    public decimal Price { get; set; }
    public string? Region { get; set; }
    public string? MainPhoto { get; set; }
    public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
    public string PublicationStatus { get; set; } = "Active";

    // Navigation Property
    public User User { get; set; } = null!;
}
