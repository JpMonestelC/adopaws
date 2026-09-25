using System.Security.Claims;

namespace Adopaws.Api.Extensions;

/// <summary>
/// Reads the caller's own identity out of the JWT claims set by
/// Adopaws.Application.Services.AuthService.GenerateJwt (ClaimTypes.NameIdentifier
/// carries IdUser, ClaimTypes.Role carries UserType). Controllers use this instead
/// of trusting a userId that arrives in the request body or the route, so a caller
/// can never impersonate another account.
/// </summary>
public static class ClaimsPrincipalExtensions
{
    public static int? GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var id) ? id : null;
    }

    public static string? GetUserType(this ClaimsPrincipal user)
        => user.FindFirstValue(ClaimTypes.Role);
}
