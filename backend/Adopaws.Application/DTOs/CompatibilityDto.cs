namespace Adopaws.Application.DTOs;

public class CompatibilityResultDto
{
    public int IdPet { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string PetType { get; set; } = string.Empty;
    public string? Breed { get; set; }
    public int? Age { get; set; }
    public string? Size { get; set; }
    public string? Region { get; set; }
    public int CompatibilityScore { get; set; }       // 0–100
    public string CompatibilityLevel { get; set; } = string.Empty; // Excelente / Buena / Regular / Baja (ver CompatibilityService.GetCompatibilityLevel)
    public string Explanation { get; set; } = string.Empty;
    public bool AiEnhanced { get; set; }              // true = Claude explained it, false = rule-based
}

public class RecommendationsResultDto
{
    public int IdUser { get; set; }
    public int TotalPetsAnalyzed { get; set; }
    public List<CompatibilityResultDto> Recommendations { get; set; } = new();
}
