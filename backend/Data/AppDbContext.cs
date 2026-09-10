using Microsoft.EntityFrameworkCore;
using BitacoraAudio.Api.Models;

namespace BitacoraAudio.Api.Data;

// Contexto Entity Framework Core para la base de datos de Bitácora de Audio
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<NotaAudio> NotasAudio => Set<NotaAudio>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<NotaAudio>(entity =>
        {
            entity.ToTable("notas_audio");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");

            entity.Property(e => e.Titulo)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("titulo");

            entity.Property(e => e.Etiqueta)
                .HasMaxLength(100)
                .HasColumnName("etiqueta");

            entity.Property(e => e.FrecuenciaHz)
                .IsRequired()
                .HasColumnName("frecuencia_hz");

            entity.Property(e => e.FechaCreacion)
                .IsRequired()
                .HasColumnName("fecha_creacion");
        });
    }
}
