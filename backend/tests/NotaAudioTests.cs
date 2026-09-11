using BitacoraAudio.Api.Models;
using Xunit;

namespace BitacoraAudio.Tests;

// Pruebas unitarias para validar la instanciación y reglas de NotaAudio
public class NotaAudioTests
{
    [Fact]
    public void Instantiation_WithValidParameters_ShouldSetAllPropertiesCorrectly()
    {
        // Arrange
        var titulo = "Tono de Calibración A4";
        var etiqueta = "Calibración";
        var frecuenciaHz = 440.0;
        var antesDeCrear = DateTime.UtcNow.AddSeconds(-1);

        // Act
        var nota = new NotaAudio(titulo, etiqueta, frecuenciaHz);
        var despuesDeCrear = DateTime.UtcNow.AddSeconds(1);

        // Assert
        Assert.NotNull(nota);
        Assert.Equal(titulo, nota.Titulo);
        Assert.Equal(etiqueta, nota.Etiqueta);
        Assert.Equal(frecuenciaHz, nota.FrecuenciaHz);
        Assert.InRange(nota.FechaCreacion, antesDeCrear, despuesDeCrear);
        Assert.Equal(0, nota.Id);
    }

    [Fact]
    public void Instantiation_WithExplicitFechaCreacion_ShouldRetainGivenDate()
    {
        // Arrange
        var titulo = "Test Sweep 100Hz";
        var etiqueta = "Bajos";
        var frecuenciaHz = 100.0;
        var fechaEsperada = new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc);

        // Act
        var nota = new NotaAudio(titulo, etiqueta, frecuenciaHz, fechaEsperada);

        // Assert
        Assert.Equal(fechaEsperada, nota.FechaCreacion);
    }

    [Fact]
    public void Instantiation_DefaultConstructor_ShouldHaveValidDefaults()
    {
        // Act
        var nota = new NotaAudio();

        // Assert
        Assert.NotNull(nota);
        Assert.Equal(0, nota.Id);
        Assert.Equal(string.Empty, nota.Titulo);
        Assert.Equal(string.Empty, nota.Etiqueta);
        Assert.Equal(0.0, nota.FrecuenciaHz);
        Assert.NotEqual(default(DateTime), nota.FechaCreacion);
        Assert.Null(nota.FechaModificacion);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Instantiation_WithNullOrWhitespaceTitle_ShouldThrowArgumentException(string? invalidTitle)
    {
        // Arrange
        var etiqueta = "General";
        var frecuenciaHz = 440.0;

        // Act & Assert
        var ex = Assert.Throws<ArgumentException>(() => new NotaAudio(invalidTitle!, etiqueta, frecuenciaHz));
        Assert.Contains("El título no puede estar vacío", ex.Message);
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(-1.0)]
    [InlineData(-440.0)]
    public void Instantiation_WithZeroOrNegativeFrequency_ShouldThrowArgumentOutOfRangeException(double invalidFrequency)
    {
        // Arrange
        var titulo = "Frecuencia Invalida";
        var etiqueta = "Error";

        // Act & Assert
        var ex = Assert.Throws<ArgumentOutOfRangeException>(() => new NotaAudio(titulo, etiqueta, invalidFrequency));
        Assert.Contains("La frecuencia debe ser mayor a 0 Hz", ex.Message);
    }

    [Theory]
    [InlineData(20.0, "Límite inferior audible")]
    [InlineData(432.0, "Afinación alternativa")]
    [InlineData(440.0, "Tono estándar concierto A4")]
    [InlineData(1000.0, "Tono de referencia 1 kHz")]
    [InlineData(20000.0, "Límite superior audible")]
    public void Instantiation_WithStandardFrequencies_ShouldSucceed(double frecuencia, string etiqueta)
    {
        // Arrange
        var titulo = $"Prueba de frecuencia {frecuencia} Hz";

        // Act
        var nota = new NotaAudio(titulo, etiqueta, frecuencia);

        // Assert
        Assert.Equal(frecuencia, nota.FrecuenciaHz);
        Assert.Equal(titulo, nota.Titulo);
        Assert.Equal(etiqueta, nota.Etiqueta);
    }

    [Fact]
    public void Instantiation_WithTrailingWhitespace_ShouldTrimStrings()
    {
        // Arrange
        var tituloConEspacios = "   Frecuencia Calibrada   ";
        var etiquetaConEspacios = "   Laboratorio   ";

        // Act
        var nota = new NotaAudio(tituloConEspacios, etiquetaConEspacios, 528.0);

        // Assert
        Assert.Equal("Frecuencia Calibrada", nota.Titulo);
        Assert.Equal("Laboratorio", nota.Etiqueta);
    }

    [Fact]
    public void Instantiation_WithNullEtiqueta_ShouldDefaultToEmptyString()
    {
        // Act
        var nota = new NotaAudio("Título Válido", null!, 880.0);

        // Assert
        Assert.Equal(string.Empty, nota.Etiqueta);
    }
}
