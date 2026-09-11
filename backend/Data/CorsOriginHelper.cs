using System.Text.RegularExpressions;

namespace BitacoraAudio.Api.Data;

public static class CorsOriginHelper
{
    private static readonly Regex LocalhostRegex = new(@"^http://localhost:(\d+)$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex VercelRegex = new(@"^https://([a-z0-9-]+\.)*vercel\.app$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static bool IsAllowed(string origin)
    {
        if (string.IsNullOrWhiteSpace(origin)) return true;
        if (LocalhostRegex.IsMatch(origin)) return true;
        if (VercelRegex.IsMatch(origin)) return true;

        var extraOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
        if (string.IsNullOrWhiteSpace(extraOrigins) || extraOrigins.Trim() == "*")
            return false;

        var permitidos = extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var patron in permitidos)
        {
            if (patron.Contains('*'))
            {
                var pattern = "^" + Regex.Escape(patron).Replace(@"\*", ".*") + "$";
                if (Regex.IsMatch(origin, pattern, RegexOptions.IgnoreCase)) return true;
            }
            else if (string.Equals(origin, patron, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
