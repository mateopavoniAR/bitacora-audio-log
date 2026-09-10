using BitacoraAudio.Api.Data;
using Xunit;

namespace BitacoraAudio.Tests;

// Pruebas unitarias para validar la resolución de DATABASE_URL en formato URI y ADO.NET
public class ConnectionStringHelperTests
{
    [Fact]
    public void ResolveConnectionString_WithPostgresUri_ShouldConvertCorrectly()
    {
        // Arrange
        var uri = "postgres://audio_user:secret_pass@db.example.com:5433/bitacora_prod";

        // Act
        var result = ConnectionStringHelper.ResolveConnectionString(uri);

        // Assert
        Assert.Contains("Host=db.example.com", result);
        Assert.Contains("Port=5433", result);
        Assert.Contains("Database=bitacora_prod", result);
        Assert.Contains("Username=audio_user", result);
        Assert.Contains("Password=secret_pass", result);
    }

    [Fact]
    public void ResolveConnectionString_WithPostgresqlUriDefaultPort_ShouldUse5432()
    {
        // Arrange
        var uri = "postgresql://postgres:mysecret@localhost/bitacora_dev";

        // Act
        var result = ConnectionStringHelper.ResolveConnectionString(uri);

        // Assert
        Assert.Contains("Host=localhost", result);
        Assert.Contains("Port=5432", result);
        Assert.Contains("Database=bitacora_dev", result);
        Assert.Contains("Username=postgres", result);
        Assert.Contains("Password=mysecret", result);
    }

    [Fact]
    public void ResolveConnectionString_WithStandardAdoNetFormat_ShouldReturnAsIs()
    {
        // Arrange
        var standardConnStr = "Host=localhost;Port=5432;Database=testdb;Username=postgres;Password=password123";

        // Act
        var result = ConnectionStringHelper.ResolveConnectionString(standardConnStr);

        // Assert
        Assert.Equal(standardConnStr, result);
    }

    [Fact]
    public void ResolveConnectionString_WithNullOrEmpty_ShouldUseFallback()
    {
        // Arrange
        var fallback = "Host=fallback_host;Database=fallback_db";

        // Act
        var resultNull = ConnectionStringHelper.ResolveConnectionString(null, fallback);
        var resultEmpty = ConnectionStringHelper.ResolveConnectionString("", fallback);

        // Assert
        Assert.Equal(fallback, resultNull);
        Assert.Equal(fallback, resultEmpty);
    }
}
