using Microsoft.EntityFrameworkCore;
using BitacoraAudio.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de Controladores y Swagger / OpenAPI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Bitácora de Sesiones & Audio Log API",
        Version = "v1",
        Description = "API REST para el registro y gestión de notas de audio y frecuencias de prueba."
    });
});

// 2. Configuración de Política CORS 'AllowAll'
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Resolución de la cadena de conexión desde la variable de entorno DATABASE_URL
var rawDatabaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var fallbackConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var connectionString = ConnectionStringHelper.ResolveConnectionString(rawDatabaseUrl, fallbackConnection);

// Configuración de Entity Framework Core con Npgsql (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    });
});

var app = builder.Build();

// 4. Inicialización y aseguramiento del esquema de la Base de Datos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("Verificando y asegurando esquema de base de datos PostgreSQL...");
        context.Database.EnsureCreated();
        context.Database.ExecuteSqlRaw(
            "ALTER TABLE notas_audio ADD COLUMN IF NOT EXISTS fecha_modificacion timestamp with time zone NULL;");
        logger.LogInformation("Esquema de base de datos verificado exitosamente.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al inicializar o conectar con la base de datos PostgreSQL.");
    }
}

// 5. Configuración del Pipeline HTTP
if (app.Environment.IsDevelopment() || app.Environment.IsProduction() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bitacora Audio Log API v1");
        c.RoutePrefix = "swagger";
    });
}

// Aplicar política CORS requerida 'AllowAll'
app.UseCors("AllowAll");

app.UseAuthorization();

// Endpoint de Health Check
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapControllers();

app.Run();

// Declaración pública parcial para permitir WebApplicationFactory en pruebas de integración si fuera necesario
public partial class Program { }
