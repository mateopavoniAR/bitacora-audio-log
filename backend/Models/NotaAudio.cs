namespace BitacoraAudio.Api.Models;

// Entidad para registro de notas de audio y frecuencias de prueba
public class NotaAudio
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;
    public double FrecuenciaHz { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Constructor requerido por Entity Framework Core
    public NotaAudio()
    {
        FechaCreacion = DateTime.UtcNow;
    }

    // Constructor para instanciación con validación de dominio
    public NotaAudio(string titulo, string etiqueta, double frecuenciaHz, DateTime? fechaCreacion = null)
    {
        if (string.IsNullOrWhiteSpace(titulo))
        {
            throw new ArgumentException("El título no puede estar vacío.", nameof(titulo));
        }

        if (frecuenciaHz <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(frecuenciaHz), "La frecuencia debe ser mayor a 0 Hz.");
        }

        Titulo = titulo.Trim();
        Etiqueta = etiqueta?.Trim() ?? string.Empty;
        FrecuenciaHz = frecuenciaHz;
        FechaCreacion = fechaCreacion ?? DateTime.UtcNow;
    }
}
