using BitacoraAudio.Api.Data;
using Xunit;

namespace BitacoraAudio.Tests;

public class CorsOriginHelperTests
{
    [Theory]
    [InlineData("http://localhost:5173")]
    [InlineData("http://localhost:8080")]
    [InlineData("http://localhost:3000")]
    public void IsAllowed_LocalhostAnyPort_ShouldBeAllowed(string origin)
    {
        Assert.True(CorsOriginHelper.IsAllowed(origin));
    }

    [Theory]
    [InlineData("https://vercel.app")]
    [InlineData("https://mi-app-test.vercel.app")]
    [InlineData("https://mi-app.vercel.app")]
    [InlineData("https://mi-app-preview-git-desarrollo-hash.vercel.app")]
    public void IsAllowed_VercelWildcard_ShouldBeAllowed(string origin)
    {
        Assert.True(CorsOriginHelper.IsAllowed(origin));
    }

    [Fact]
    public void IsAllowed_WithAllowedOriginsEnv_ShouldAllowListedOrigins()
    {
        try
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", "https://api.ejemplo.com,http://panel.midominio.com");
            Assert.True(CorsOriginHelper.IsAllowed("https://api.ejemplo.com"));
            Assert.True(CorsOriginHelper.IsAllowed("http://panel.midominio.com"));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", null);
        }
    }

    [Fact]
    public void IsAllowed_WithAllowedOriginsEnv_ShouldStillAllowLocalhost()
    {
        try
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", "https://api.ejemplo.com");
            Assert.True(CorsOriginHelper.IsAllowed("http://localhost:9999"));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", null);
        }
    }

    [Fact]
    public void IsAllowed_WithAllowedOriginsEnv_ShouldDenyUnknownOrigin()
    {
        try
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", "https://api.ejemplo.com");
            Assert.False(CorsOriginHelper.IsAllowed("https://origen-malicioso.com"));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", null);
        }
    }

    [Fact]
    public void IsAllowed_WithoutAllowedOriginsEnv_ShouldDenyUnknownOrigin()
    {
        Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", null);
        Assert.False(CorsOriginHelper.IsAllowed("https://origen-malicioso.com"));
    }

    [Fact]
    public void IsAllowed_WithWildcardEntryInAllowedOrigins_ShouldMatchPattern()
    {
        try
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", "https://*.midominio.com");
            Assert.True(CorsOriginHelper.IsAllowed("https://sub.midominio.com"));
            Assert.True(CorsOriginHelper.IsAllowed("https://a.b.midominio.com"));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ALLOWED_ORIGINS", null);
        }
    }
}