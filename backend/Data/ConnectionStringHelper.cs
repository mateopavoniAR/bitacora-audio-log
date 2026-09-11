namespace BitacoraAudio.Api.Data;

// Normaliza la variable DATABASE_URL admitiendo formato URI (postgres://) o formato ADO.NET
public static class ConnectionStringHelper
{
    public static string ResolveConnectionString(string? rawUrl, string? fallback = null, bool requireSsl = false)
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
            return ParsePostgresUri(target, requireSsl);
        }

        if (requireSsl)
        {
            return EnsureSslMode(target);
        }

        return target;
    }

    private static string ParsePostgresUri(string uriString, bool requireSsl)
    {
        var uri = new Uri(uriString);

        var userInfoParts = uri.UserInfo.Split(':');
        var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
        var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;

        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');
        var esLocal = host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || host == "127.0.0.1";
        var sslMode = requireSsl && !esLocal ? "Require" : "Prefer";

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

        builder.Append($"SSL Mode={sslMode};Trust Server Certificate=true;");

        return builder.ToString();
    }

    private static string EnsureSslMode(string connectionString)
    {
        if (connectionString.Contains("SSL Mode=", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        var esLocal = connectionString.Contains("localhost", StringComparison.OrdinalIgnoreCase) ||
                      connectionString.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase);
        var sslMode = esLocal ? "Prefer" : "Require";

        return connectionString.TrimEnd(';', ' ') + $";SSL Mode={sslMode};Trust Server Certificate=true;";
    }
}
