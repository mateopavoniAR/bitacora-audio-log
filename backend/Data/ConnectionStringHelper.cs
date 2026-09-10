namespace BitacoraAudio.Api.Data;

// Normaliza la variable DATABASE_URL admitiendo formato URI (postgres://) o formato ADO.NET
public static class ConnectionStringHelper
{
    public static string ResolveConnectionString(string? rawUrl, string? fallback = null)
    {
        var target = string.IsNullOrWhiteSpace(rawUrl) ? fallback : rawUrl;

        if (string.IsNullOrWhiteSpace(target))
        {
            return string.Empty;
        }

        target = target.Trim();

        // Convertir formato URI (postgres:// o postgresql://) a formato de Npgsql si es necesario
        if (target.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            target.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return ParsePostgresUri(target);
        }

        return target;
    }

    private static string ParsePostgresUri(string uriString)
    {
        var uri = new Uri(uriString);

        var userInfoParts = uri.UserInfo.Split(':');
        var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
        var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;

        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        var builder = new System.Text.StringBuilder();
        builder.Append($"Host={host};");
        builder.Append($"Port={port};");
        builder.Append($"Database={database};");

        if (!string.IsNullOrEmpty(username))
        {
            builder.Append($"Username={username};");
        }

        if (!string.IsNullOrEmpty(password))
        {
            builder.Append($"Password={password};");
        }

        builder.Append("SSL Mode=Prefer;Trust Server Certificate=true;");

        return builder.ToString();
    }
}
