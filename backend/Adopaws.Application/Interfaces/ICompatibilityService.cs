using Adopaws.Application.DTOs;

namespace Adopaws.Application.Interfaces;

public interface ICompatibilityService
{
    /// <summary>
    /// Calculates compatibility score between a user and a specific pet.
    /// Uses Claude AI for explanation if API key is configured, falls back to rule-based.
    /// </summary>
    Task<CompatibilityResultDto> GetCompatibilityAsync(int userId, int petId);

    /// <summary>
    /// Returns all available pets ranked by compatibility score for a given user.
    /// </summary>
    Task<RecommendationsResultDto> GetRecommendationsAsync(int userId, int topN = 10);
}
