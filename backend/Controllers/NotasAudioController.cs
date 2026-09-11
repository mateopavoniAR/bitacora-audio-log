using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BitacoraAudio.Api.Data;
using BitacoraAudio.Api.DTOs;
using BitacoraAudio.Api.Models;

namespace BitacoraAudio.Api.Controllers;

[ApiController]
[Route("api/notasaudio")]
[Produces("application/json")]
public class NotasAudioController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotasAudioController> _logger;

    public NotasAudioController(AppDbContext context, ILogger<NotasAudioController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET /api/notasaudio - Obtiene todas las notas ordenadas por fecha reciente
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<NotaAudio>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<NotaAudio>>> GetAll()
    {
        _logger.LogInformation("Consultando listado de notas de audio.");
        var notas = await _context.NotasAudio
            .AsNoTracking()
            .OrderByDescending(n => n.FechaCreacion)
            .ToListAsync();

        return Ok(notas);
    }

    // GET /api/notasaudio/{id} - Obtiene una nota específica por su identificador
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(NotaAudio), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NotaAudio>> GetById(int id)
    {
        _logger.LogInformation("Consultando nota de audio con Id: {Id}", id);
        var nota = await _context.NotasAudio.FindAsync(id);

        if (nota == null)
        {
            _logger.LogWarning("Nota de audio con Id: {Id} no encontrada.", id);
            return NotFound(new { mensaje = $"No se encontró la nota de audio con Id {id}." });
        }

        return Ok(nota);
    }

    // POST /api/notasaudio - Crea una nueva nota de audio
    [HttpPost]
    [ProducesResponseType(typeof(NotaAudio), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<NotaAudio>> Create([FromBody] CreateNotaAudioDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(dto.Titulo))
        {
            return BadRequest(new { mensaje = "El título de la nota no puede estar vacío." });
        }

        if (dto.FrecuenciaHz <= 0)
        {
            return BadRequest(new { mensaje = "La frecuencia en Hertz debe ser un valor mayor a 0." });
        }

        var nuevaNota = new NotaAudio
        {
            Titulo = dto.Titulo.Trim(),
            Etiqueta = dto.Etiqueta?.Trim() ?? string.Empty,
            FrecuenciaHz = dto.FrecuenciaHz,
            FechaCreacion = dto.FechaCreacion ?? DateTime.UtcNow
        };

        _context.NotasAudio.Add(nuevaNota);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Nota creada con Id: {Id}, Frecuencia: {Freq} Hz", nuevaNota.Id, nuevaNota.FrecuenciaHz);

        return CreatedAtAction(nameof(GetById), new { id = nuevaNota.Id }, nuevaNota);
    }

    // PUT /api/notasaudio/{id} - Actualiza Título, Etiqueta y FrecuenciaHz de una nota existente
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(NotaAudio), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NotaAudio>> Update(int id, [FromBody] UpdateNotaAudioDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(dto.Titulo))
        {
            return BadRequest(new { mensaje = "El título de la nota no puede estar vacío." });
        }

        if (dto.FrecuenciaHz <= 0)
        {
            return BadRequest(new { mensaje = "La frecuencia en Hertz debe ser un valor mayor a 0." });
        }

        var nota = await _context.NotasAudio.FindAsync(id);

        if (nota == null)
        {
            _logger.LogWarning("Nota con Id: {Id} no existe para actualizar.", id);
            return NotFound(new { mensaje = $"No se encontró la nota de audio con Id {id} para actualizar." });
        }

        nota.Titulo = dto.Titulo.Trim();
        nota.Etiqueta = dto.Etiqueta?.Trim() ?? string.Empty;
        nota.FrecuenciaHz = dto.FrecuenciaHz;
        nota.FechaModificacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Nota con Id: {Id} actualizada correctamente. Frecuencia: {Freq} Hz", nota.Id, nota.FrecuenciaHz);

        return Ok(nota);
    }

    // DELETE /api/notasaudio/{id} - Elimina una nota por su identificador
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        _logger.LogInformation("Eliminando nota de audio con Id: {Id}", id);
        var nota = await _context.NotasAudio.FindAsync(id);

        if (nota == null)
        {
            _logger.LogWarning("Nota con Id: {Id} no existe.", id);
            return NotFound(new { mensaje = $"No se encontró la nota de audio con Id {id} para eliminar." });
        }

        _context.NotasAudio.Remove(nota);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Nota con Id: {Id} eliminada correctamente.", id);
        return NoContent();
    }
}
