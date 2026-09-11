using System.ComponentModel.DataAnnotations;

namespace BitacoraAudio.Api.DTOs;

// DTO para la actualización de notas de audio desde peticiones PUT
public class UpdateNotaAudioDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(200, ErrorMessage = "El título no puede exceder los 200 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "La etiqueta no puede exceder los 100 caracteres.")]
    public string Etiqueta { get; set; } = string.Empty;

    [Required(ErrorMessage = "La frecuencia es obligatoria.")]
    [Range(0.01, 200000.0, ErrorMessage = "La frecuencia debe ser un valor positivo en Hertz (mayor a 0).")]
    public double FrecuenciaHz { get; set; }
}