using Adopaws.Infrastructure.Security;

namespace Adopaws.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_NuncaDebeDevolverElTextoPlano()
    {
        var hash = _hasher.Hash("mi-contraseña-super-secreta");

        Assert.NotEqual("mi-contraseña-super-secreta", hash);
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact]
    public void Verify_DebeAceptarLaContraseñaCorrecta()
    {
        var hash = _hasher.Hash("correcta123");

        Assert.True(_hasher.Verify("correcta123", hash));
    }

    [Fact]
    public void Verify_DebeRechazarLaContraseñaIncorrecta()
    {
        var hash = _hasher.Hash("correcta123");

        Assert.False(_hasher.Verify("otra-cosa", hash));
    }

    [Fact]
    public void Verify_DebeRechazarUnHashConFormatoInvalidoSinLanzarExcepcion()
    {
        // Simula una fila vieja con contraseña en texto plano (pre-fix):
        // no debe tronar, solo fallar la verificación.
        var resultado = _hasher.Verify("cualquier-cosa", "1234");

        Assert.False(resultado);
    }

    [Fact]
    public void Hash_DebeGenerarSaltDistintoCadaVez()
    {
        var hash1 = _hasher.Hash("misma-contraseña");
        var hash2 = _hasher.Hash("misma-contraseña");

        Assert.NotEqual(hash1, hash2);
        Assert.True(_hasher.Verify("misma-contraseña", hash1));
        Assert.True(_hasher.Verify("misma-contraseña", hash2));
    }
}
