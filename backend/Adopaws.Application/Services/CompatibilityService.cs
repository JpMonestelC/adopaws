using System.Text;
using System.Text.Json;
using Adopaws.Application.DTOs;
using Adopaws.Application.Interfaces;
using Adopaws.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Adopaws.Application.Services;

public class CompatibilityService : ICompatibilityService
{
    private readonly IUserRepository _userRepository;
    private readonly IPetRepository _petRepository;
    private readonly IAdoptionRequestRepository _adoptionRequestRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CompatibilityService> _logger;
    private readonly HttpClient _httpClient;

    public CompatibilityService(
        IUserRepository userRepository,
        IPetRepository petRepository,
        IAdoptionRequestRepository adoptionRequestRepository,
        IConfiguration configuration,
        ILogger<CompatibilityService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _userRepository = userRepository;
        _petRepository = petRepository;
        _adoptionRequestRepository = adoptionRequestRepository;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("AnthropicClient");
    }

    public async Task<CompatibilityResultDto> GetCompatibilityAsync(int userId, int petId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"Usuario {userId} no encontrado.");

        var pet = await _petRepository.GetByIdAsync(petId)
            ?? throw new KeyNotFoundException($"Mascota {petId} no encontrada.");

        var userRequests = await _adoptionRequestRepository.GetByUserIdAsync(userId);
        var existingRequest = userRequests.FirstOrDefault(r => r.IdPet == petId);
        var latestRequest = userRequests.OrderByDescending(r => r.RequestDate).FirstOrDefault();
        var requestForScoring = existingRequest ?? latestRequest;
        var hasExistingRequest = existingRequest != null;

        var score = CalculateRuleBasedScore(user, pet, requestForScoring);
        var level = GetCompatibilityLevel(score);
        var explanation = await GetExplanationAsync(user, pet, requestForScoring, score, level, hasExistingRequest);
        var aiEnhanced = !string.IsNullOrEmpty(_configuration["Anthropic:ApiKey"]);

        return new CompatibilityResultDto
        {
            IdPet = pet.IdPet,
            PetName = pet.Name,
            PetType = pet.PetType,
            Breed = pet.Breed,
            Age = pet.Age,
            Size = pet.Size,
            Region = pet.Region,
            CompatibilityScore = score,
            CompatibilityLevel = level,
            Explanation = explanation,
            AiEnhanced = aiEnhanced
        };
    }

    public async Task<RecommendationsResultDto> GetRecommendationsAsync(int userId, int topN = 10)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"Usuario {userId} no encontrado.");

        var allPets = await _petRepository.GetAllAsync();
        var availablePets = allPets
            .Where(p => p.PublicationStatus == "Available" && p.IdUser != userId)
            .ToList();

        var userRequests = await _adoptionRequestRepository.GetByUserIdAsync(userId);
        var latestRequest = userRequests.OrderByDescending(r => r.RequestDate).FirstOrDefault();

        var scored = availablePets
            .Select(pet =>
            {
                var score = CalculateRuleBasedScore(user, pet, latestRequest);
                var level = GetCompatibilityLevel(score);
                return new CompatibilityResultDto
                {
                    IdPet = pet.IdPet,
                    PetName = pet.Name,
                    PetType = pet.PetType,
                    Breed = pet.Breed,
                    Age = pet.Age,
                    Size = pet.Size,
                    Region = pet.Region,
                    CompatibilityScore = score,
                    CompatibilityLevel = level,
                    Explanation = BuildRuleBasedExplanation(user, pet, latestRequest, score, level, false),
                    AiEnhanced = false
                };
            })
            .OrderByDescending(r => r.CompatibilityScore)
            .Take(topN)
            .ToList();

        var apiKey = _configuration["Anthropic:ApiKey"];
        if (!string.IsNullOrEmpty(apiKey))
        {
            for (int i = 0; i < Math.Min(3, scored.Count); i++)
            {
                var result = scored[i];
                var pet = availablePets.First(p => p.IdPet == result.IdPet);
                result.Explanation = await GetExplanationAsync(user, pet, latestRequest, result.CompatibilityScore, result.CompatibilityLevel, false);
                result.AiEnhanced = true;
            }
        }

        return new RecommendationsResultDto
        {
            IdUser = userId,
            TotalPetsAnalyzed = availablePets.Count,
            Recommendations = scored
        };
    }

    // ─────────────────────────────────────────────
    // TRADUCCIONES AL ESPAÑOL
    // ─────────────────────────────────────────────

    private static bool IsFemale(string? gender) =>
        gender?.ToLower() is "female" or "hembra";

    // Devuelve "un perro" / "una perra" / "un gato" / "una gata" etc.
    private static string TranslatePetWithArticle(string? petType, string? gender)
    {
        var female = IsFemale(gender);
        return petType?.ToLower() switch
        {
            "dog"    => female ? "una perra"    : "un perro",
            "cat"    => female ? "una gata"     : "un gato",
            "rabbit" => female ? "una coneja"   : "un conejo",
            "bird"   => female ? "un ave"       : "un ave",
            "other"  => female ? "una mascota"  : "un animal",
            _        => female ? "una mascota"  : "un animal"
        };
    }

    // Devuelve solo el tipo sin artículo: "perro" / "perra" etc.
    private static string TranslatePetType(string? petType, string? gender)
    {
        var female = IsFemale(gender);
        return petType?.ToLower() switch
        {
            "dog"    => female ? "perra"   : "perro",
            "cat"    => female ? "gata"    : "gato",
            "rabbit" => female ? "coneja"  : "conejo",
            "bird"   => "ave",
            "other"  => female ? "mascota" : "animal",
            _        => female ? "mascota" : "animal"
        };
    }

    // Vacunado/a y esterilizado/a según género
    private static string VacunadoText(string? gender) =>
        IsFemale(gender) ? "vacunada" : "vacunado";

    private static string EsterilizadoText(string? gender) =>
        IsFemale(gender) ? "esterilizada" : "esterilizado";

    private static string TranslateSize(string? size) => size?.ToLower() switch
    {
        "small"  => "pequeño",
        "medium" => "mediano",
        "large"  => "grande",
        _        => size ?? "desconocido"
    };

    private static string TranslateHousingType(string? housingType) => housingType?.ToLower() switch
    {
        "house"           => "casa",
        "apartment"       => "apartamento",
        "house with yard" => "casa con jardín",
        _                 => housingType ?? "vivienda"
    };

    // ─────────────────────────────────────────────
    // MOTOR DE PUNTUACIÓN
    // ─────────────────────────────────────────────

    private int CalculateRuleBasedScore(User user, Pet pet, AdoptionRequest? request)
    {
        int score = 0;
        score += ScoreHousingVsSize(request?.HousingType, pet.Size);
        score += ScoreExperienceVsAge(request?.PetExperience, pet.Age);
        score += ScoreOtherPets(request?.HasOtherPets ?? false, pet.PetType, pet.Description);
        score += ScoreRegion(user.Region, pet.Region);
        if (pet.Vaccinated) score += 5;
        if (pet.Sterilized) score += 5;
        if (user.IsVerified) score += 5;
        if (!string.IsNullOrEmpty(request?.AdoptionReason)) score += 5;
        score += ScoreProfileDescription(user.ProfileDescription, pet);
        return Math.Min(score, 100);
    }

    private int ScoreProfileDescription(string? profileDescription, Pet pet)
    {
        if (string.IsNullOrEmpty(profileDescription)) return 0;
        var desc = profileDescription.ToLower();
        int bonus = 0;
        if (desc.Contains("experiencia") || desc.Contains("mascota") || desc.Contains("animal") ||
            desc.Contains("perro") || desc.Contains("gato") || desc.Contains("pet"))
            bonus += 5;
        if (desc.Contains("casa") || desc.Contains("jardín") || desc.Contains("patio") ||
            desc.Contains("espacio") || desc.Contains("house") || desc.Contains("yard"))
            bonus += 3;
        if (desc.Contains("familia") || desc.Contains("responsable") || desc.Contains("amor") ||
            desc.Contains("cuidar") || desc.Contains("quiero") || desc.Contains("family"))
            bonus += 2;
        return Math.Min(bonus, 10);
    }

    private int ScoreHousingVsSize(string? housingType, string? petSize)
    {
        if (string.IsNullOrEmpty(housingType) || string.IsNullOrEmpty(petSize)) return 10;
        var housing = housingType.ToLower();
        var size = petSize.ToLower();
        return (housing, size) switch
        {
            ("apartamento", "small")  or ("apartment", "small")            => 25,
            ("apartamento", "medium") or ("apartment", "medium")           => 15,
            ("apartamento", "large")  or ("apartment", "large")            => 5,
            ("casa", "small")         or ("house", "small")                => 20,
            ("casa", "medium")        or ("house", "medium")               => 25,
            ("casa", "large")         or ("house", "large")                => 25,
            ("casa con jardín", "small")  or ("house with yard", "small")  => 22,
            ("casa con jardín", "medium") or ("house with yard", "medium") => 25,
            ("casa con jardín", "large")  or ("house with yard", "large")  => 25,
            _ => 10
        };
    }

    private int ScoreExperienceVsAge(string? experience, int? petAge)
    {
        if (string.IsNullOrEmpty(experience) || petAge is null) return 10;
        var exp = experience.ToLower();
        var age = petAge.Value;
        if (age < 1)
            return exp.Contains("experiencia") || exp.Contains("experienced") || exp.Contains("experto") ? 20 : 8;
        if (age <= 7) return 20;
        return exp.Contains("ninguna") || exp.Contains("primera") || exp.Contains("none") || exp.Contains("first") ? 18 : 20;
    }

    private int ScoreOtherPets(bool hasOtherPets, string petType, string? description)
    {
        if (!hasOtherPets) return 20;
        var desc = (description ?? "").ToLower();
        if (desc.Contains("amigable") || desc.Contains("sociable") || desc.Contains("friendly") || desc.Contains("social"))
            return 20;
        if (desc.Contains("única mascota") || desc.Contains("solo") || desc.Contains("agresivo") || desc.Contains("aggressive"))
            return 5;
        return 12;
    }

    private int ScoreRegion(string? userRegion, string? petRegion)
    {
        if (string.IsNullOrEmpty(userRegion) || string.IsNullOrEmpty(petRegion)) return 7;
        return userRegion.Equals(petRegion, StringComparison.OrdinalIgnoreCase) ? 15 : 5;
    }

    private string GetCompatibilityLevel(int score) => score switch
    {
        >= 85 => "Excelente",
        >= 65 => "Buena",
        >= 45 => "Regular",
        _ => "Baja"
    };

    // ─────────────────────────────────────────────
    // EXPLICACIÓN EN ESPAÑOL (sin IA)
    // ─────────────────────────────────────────────

    private string BuildRuleBasedExplanation(User user, Pet pet, AdoptionRequest? request, int score, string level, bool hasExistingRequest)
    {
        var parts = new List<string>();
        var hasProfile = !string.IsNullOrEmpty(user.ProfileDescription);

        var conArticulo = TranslatePetWithArticle(pet.PetType, pet.Gender);
        var tipoSolo    = TranslatePetType(pet.PetType, pet.Gender);
        var tamPet      = TranslateSize(pet.Size);
        var tipoViv     = TranslateHousingType(request?.HousingType);
        var vacText     = VacunadoText(pet.Gender);
        var estText     = EsterilizadoText(pet.Gender);

        // Introducción
        if (hasProfile)
            parts.Add($"En base a la descripción de tu perfil, se estima una compatibilidad {level.ToLower()} con {pet.Name}.");
        else
            parts.Add($"En base a tu información de usuario, se estima una compatibilidad {level.ToLower()} con {pet.Name}.");

        // Descripción de la mascota con género correcto
        var edadTexto = pet.Age.HasValue ? $" de {pet.Age} {(pet.Age == 1 ? "año" : "años")}" : "";
        var razaTexto = pet.Breed != null ? $" ({pet.Breed})" : "";
        parts.Add($"{pet.Name} es {conArticulo}{razaTexto}{edadTexto}.");

        // Vivienda vs tamaño
        if (!string.IsNullOrEmpty(request?.HousingType) && !string.IsNullOrEmpty(pet.Size))
            parts.Add($"Tu {tipoViv} es {(score >= 65 ? "adecuada" : "un factor a considerar")} para {conArticulo} de tamaño {tamPet}.");

        // Salud con género
        if (pet.Vaccinated && pet.Sterilized)
            parts.Add($"{pet.Name} está completamente {vacText} y {estText}, lo que facilita la transición.");
        else if (pet.Vaccinated)
            parts.Add($"{pet.Name} está {vacText}.");

        // Mensaje final
        if (hasExistingRequest)
            parts.Add("Ya realizaste tu solicitud de adopción — tu compatibilidad ha sido recalculada con la información completa de tu solicitud.");
        else
            parts.Add("¡Cuando realices tu solicitud de adopción se recalculará tu compatibilidad con la nueva información!");

        return string.Join(" ", parts);
    }

    // ─────────────────────────────────────────────
    // EXPLICACIÓN CON CLAUDE IA
    // ─────────────────────────────────────────────

    private async Task<string> GetExplanationAsync(User user, Pet pet, AdoptionRequest? request, int score, string level, bool hasExistingRequest)
    {
        var apiKey = _configuration["Anthropic:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return BuildRuleBasedExplanation(user, pet, request, score, level, hasExistingRequest);

        try
        {
            var prompt = BuildClaudePrompt(user, pet, request, score, level, hasExistingRequest);
            var requestBody = new
            {
                model = "claude-sonnet-4-20250514",
                max_tokens = 350,
                messages = new[] { new { role = "user", content = prompt } }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

            var response = await _httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Claude API devolvió {StatusCode}.", response.StatusCode);
                return BuildRuleBasedExplanation(user, pet, request, score, level, hasExistingRequest);
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var explanation = doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString();
            return explanation ?? BuildRuleBasedExplanation(user, pet, request, score, level, hasExistingRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en Claude API.");
            return BuildRuleBasedExplanation(user, pet, request, score, level, hasExistingRequest);
        }
    }

    private string BuildClaudePrompt(User user, Pet pet, AdoptionRequest? request, int score, string level, bool hasExistingRequest)
    {
        var conArticulo = TranslatePetWithArticle(pet.PetType, pet.Gender);
        var tipoSolo    = TranslatePetType(pet.PetType, pet.Gender);
        var tamPet      = TranslateSize(pet.Size);
        var tipoViv     = TranslateHousingType(request?.HousingType);
        var generoTexto = IsFemale(pet.Gender) ? "hembra" : "macho";
        var perfilBase  = string.IsNullOrEmpty(user.ProfileDescription) ? "no especificada" : user.ProfileDescription;

        var mensajeFinal = hasExistingRequest
            ? "El usuario ya realizó su solicitud de adopción. Termina indicando que su compatibilidad ha sido recalculada con la información completa de su solicitud."
            : "Termina con exactamente esta frase: '¡Cuando realices tu solicitud de adopción se recalculará tu compatibilidad con la nueva información!'";

        return $"""
            Eres un asesor experto en adopción de mascotas para la plataforma Adopaws.

            Escribe una explicación cálida, honesta y útil de 2-3 oraciones completamente en ESPAÑOL.
            No uses viñetas, listas ni palabras en inglés bajo ninguna circunstancia.
            Usa el género correcto de la mascota en todo momento.

            Comienza SIEMPRE con esta frase exacta:
            "En base a la descripción de tu perfil, se estima una compatibilidad {level.ToLower()} con {pet.Name}."

            PERFIL DEL USUARIO:
            - Descripción del perfil: {perfilBase}
            - Tipo de vivienda: {tipoViv}
            - Experiencia con mascotas: {request?.PetExperience ?? "no especificada"}
            - Tiene otras mascotas: {(request?.HasOtherPets == true ? "Sí" : "No")}
            - Razón de adopción: {request?.AdoptionReason ?? "no especificada"}
            - Región: {user.Region ?? "no especificada"}

            PERFIL DE LA MASCOTA:
            - Nombre: {pet.Name}
            - Tipo: {tipoSolo} ({generoTexto})
            - Raza: {pet.Breed ?? "mestizo/a"}
            - Edad: {(pet.Age.HasValue ? $"{pet.Age} {(pet.Age == 1 ? "año" : "años")}" : "desconocida")}
            - Tamaño: {tamPet}
            - Vacunado/a: {(pet.Vaccinated ? "Sí" : "No")}
            - Esterilizado/a: {(pet.Sterilized ? "Sí" : "No")}
            - Descripción: {pet.Description ?? "ninguna"}
            - Región: {pet.Region ?? "no especificada"}

            PUNTUACIÓN: {score}/100 ({level})

            {mensajeFinal}

            Escribe la explicación ahora, completamente en español y con el género correcto:
            """;
    }
}
