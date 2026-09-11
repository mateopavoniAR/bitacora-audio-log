# Arquitectura Real del Backend .NET

Este documento describe la arquitectura real, patrones y componentes del backend reconstruidos a partir de la evidencia estricta del código fuente. Cada afirmación se encuentra clasificada como:
- **`[FACT]`**: Verificado y respaldado por el código existente.
- **`[ASSUMPTION]`**: Inferido a partir del contexto pero no confirmado por código ejecutable.
- **`[UNKNOWN]`**: Información no determinada o ausente en el repositorio.

---

## 1. Topología del Sistema y Estructura de Proyectos

### 1.1 Estructura en Disco Real vs. Convenciones Estándar de .NET
- **Estructura Real `[FACT]`:**
  El backend reside bajo la carpeta `/backend` en un esquema compacto y relativamente plano:
  ```text
  /backend
  ├── Controllers/
  │   └── NotasAudioController.cs      # Controlador REST
  ├── Data/
  │   ├── AppDbContext.cs              # DbContext de EF Core
  │   └── ConnectionStringHelper.cs    # Utilidad de resolución de conexiones PostgreSQL
  ├── DTOs/
  │   ├── CreateNotaAudioDto.cs        # DTO de entrada para POST
  │   └── UpdateNotaAudioDto.cs        # DTO de entrada para PUT
  ├── Migrations/                      # Migraciones EF Core generadas
  │   ├── AppDbContextModelSnapshot.cs
  │   └── 20260911170120_AddFechaModificacion.cs  # Agrega columna fecha_modificacion
  ├── Models/
  │   └── NotaAudio.cs                 # Entidad de dominio
  ├── tests/
  │   ├── BitacoraAudio.Tests.csproj   # Proyecto xUnit
  │   ├── ConnectionStringHelperTests.cs
  │   └── NotaAudioTests.cs
  ├── appsettings.json
  ├── appsettings.Development.json
  ├── Backend.sln                      # Solución .NET que agrupa API y Tests
  ├── BitacoraAudio.Api.csproj         # Proyecto Web API .NET 8
  ├── Dockerfile                       # Multi-stage build .NET 8
  └── README.md
  ```
- **Divergencias respecto a convenciones estándar de .NET `[FACT]`:**
  1. *Ubicación de Tests:* Es convención general separar los proyectos en `src/` y `tests/` al nivel de solución (ej. `/src/BitacoraAudio.Api` y `/tests/BitacoraAudio.Tests`). En esta solución, la carpeta `tests/` está anidada dentro del directorio de la API (`/backend/tests`) y el archivo de proyecto `BitacoraAudio.Api.csproj` contiene reglas de exclusión explícitas (`<Compile Remove="tests\**" />`) para evitar que el compilador de la API intente compilar los tests como parte del binario de producción.
  2. *Ausencia de capa de Servicios / Repositorios:* No existe capa intermedia de aplicación o servicio (`Services/`) ni abstracción de repositorios (`Repositories/`). El controlador interactúa directamente con el contexto de Entity Framework Core.
  3. *Ausencia de `launchSettings.json`:* No existe el directorio `Properties/launchSettings.json`, lo que deja la configuración de puertos en ejecución local de `dotnet run` sujeta a las variables de entorno o valores por omisión de Kestrel.

---

## 2. Capas y Patrones de Diseño Implementados

### 2.1 Patrones Verificados en Código
- **Dependency Injection (DI) `[FACT]`:** Uso del contenedor nativo de ASP.NET Core (`Microsoft.Extensions.DependencyInjection`). Se registran controladores (`AddControllers`), contexto de base de datos (`AddDbContext<AppDbContext>`), explorador de endpoints (`AddEndpointsApiExplorer`), Swagger (`AddSwaggerGen`) y política CORS (`AddCors`).
- **Entity Framework Core (Code-First) con Npgsql `[FACT]`:**
  - Proveedor: `Npgsql.EntityFrameworkCore.PostgreSQL` v8.0.4.
  - Configuración Fluent API en `AppDbContext.OnModelCreating`.
  - Estrategia de inicialización: `context.Database.EnsureCreated()` ejecutada en un `IServiceScope` dentro de `Program.cs`.
  - **Migraciones EF Core `[FACT]`:** Existe la carpeta `Migrations/` con la migración `AddFechaModificacion` (agrega la columna nullable `fecha_modificacion`). A nivel runtime se sigue usando `EnsureCreated()`, por lo que la migración queda como documentación evolutiva y no se aplica con `Database.Migrate()`.
  - **Sincronización aditiva idempotente `[FACT]`:** `Program.cs` ejecuta tras `EnsureCreated()` un `ALTER TABLE notas_audio ADD COLUMN IF NOT EXISTS fecha_modificacion timestamp with time zone NULL;`. Esto resuelve la actualización de bases existentes creadas con `EnsureCreated()` (que no altera esquemas ya existentes) sin necesidad de eliminar volúmenes ni perder datos.
  - Resiliencia de conexión: Configurada mediante `EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10))`.
- **Patrón DTO Asimétrico `[FACT]`:**
  - Se utiliza `CreateNotaAudioDto` para recibir datos en `POST /api/notasaudio` y `UpdateNotaAudioDto` para `PUT /api/notasaudio/{id}`.
  - Los endpoints de lectura (`GET /api/notasaudio` y `GET /api/notasaudio/{id}`) retornan directamente la entidad de dominio `NotaAudio` sin mediar un `ReadNotaAudioDto`.
  - `PUT` devuelve la entidad actualizada con ambas marcas de tiempo (`FechaCreacion` y `FechaModificacion`).
- **Minimal API vs. Controller Base `[FACT]`:**
  - Minimal APIs se utilizan para utilidades de infraestructura: `GET /health` y `GET /` (redirección a `/swagger`).
  - Controllers clásicos (`ControllerBase` con atributos `[ApiController]` y `[Route]`) se utilizan para los endpoints de negocio en `NotasAudioController`.

---

## 3. Modelo de Autenticación y Autorización

- **Estado Real: NO EXISTE AUTENTICACIÓN NI AUTORIZACIÓN `[FACT]`:**
  - El archivo `Program.cs` invoca `app.UseAuthorization();` en la línea 81, pero **no registra ningún esquema de autenticación** (`builder.Services.AddAuthentication(...)` no existe en el proyecto).
  - No hay dependencias de JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`), cookies de autenticación, ASP.NET Core Identity ni OAuth.
  - Ningún endpoint ni controlador posee el atributo `[Authorize]`.
  - **Tokens, Claims y Roles `[FACT]`:** Inexistentes. El sistema no emite ni valida tokens de ningún tipo. Todos los endpoints son 100% de acceso público.

---

## 4. Modelo de Datos y Persistencia

### 4.1 Entidad Principal: `NotaAudio` `[FACT]`
Definida en `BitacoraAudio.Api.Models.NotaAudio`:
- `Id` (`int`): Clave primaria, autoincremental en PostgreSQL (`serial`/`identity`). Mapeada a la columna `id`.
- `Titulo` (`string`): Obligatorio, longitud máxima 200 caracteres. Mapeado a la columna `titulo`.
- `Etiqueta` (`string`): Opcional, longitud máxima 100 caracteres. Mapeado a la columna `etiqueta`. Por defecto `string.Empty`.
- `FrecuenciaHz` (`double`): Obligatorio, valor positivo en Hertz. Mapeado a la columna `frecuencia_hz`.
- `FechaCreacion` (`DateTime`): Obligatorio, timestamp UTC. Mapeado a la columna `fecha_creacion`.
- `FechaModificacion` (`DateTime?`): Opcional/nulleable, timestamp UTC de última edición. Mapeado a la columna `fecha_modificacion`. Se asigna `DateTime.UtcNow` en el endpoint `PUT`. Permanece `null` para notas nunca editadas.
- **Reglas de Dominio en el Modelo `[FACT]`:** La clase cuenta con un constructor secundario que arroja `ArgumentException` si `titulo` es nulo/espacio en blanco, y `ArgumentOutOfRangeException` si `frecuenciaHz <= 0`.
- **Tabla en Base de Datos `[FACT]`:** Mapeada a `"notas_audio"` en `AppDbContext.cs`.
- **Relaciones `[FACT]`:** Ninguna. Es una entidad aislada sin claves foráneas ni tablas vinculadas.

### 4.2 Helper de Conexión: `ConnectionStringHelper` `[FACT]`
- Soporta formato URI estándar (`postgres://usuario:password@host:puerto/database` o `postgresql://...`).
- Convierte automáticamente dicho formato al formato ADO.NET requerido por Npgsql (`Host=...;Port=...;Database=...;Username=...;Password=...;SSL Mode=Prefer;Trust Server Certificate=true;`).
- Si la variable `DATABASE_URL` no está definida, toma como fallback la cadena `ConnectionStrings:DefaultConnection` de `appsettings.json`.

---

## 5. Manejo de Errores y Formato de Respuestas

- **Consistencia de Formato de Error: INCONSISTENTE `[FACT]`:**
  Existen dos formatos diferentes devueltos por la API ante situaciones de error:
  1. **Formato RFC 7807 / 9110 (`ValidationProblemDetails`) `[FACT]`:**
     - Generado automáticamente por ASP.NET Core o vía `BadRequest(ModelState)` cuando fallan las validaciones de DataAnnotations de `CreateNotaAudioDto`.
     - Estructura:
       ```json
       {
         "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
         "title": "One or more validation errors occurred.",
         "status": 400,
         "errors": {
           "Titulo": ["El título es obligatorio."],
           "FrecuenciaHz": ["La frecuencia debe ser un valor positivo en Hertz (mayor a 0)."]
         }
       }
       ```
  2. **Formato Personalizado con Tipo Anónimo `[FACT]`:**
     - Generado manualmente en el controlador ante recursos no encontrados o validaciones adicionales:
- `GetById(id)` retorna `404 Not Found` con `{ "mensaje": "No se encontró la nota de audio con Id {id}." }`.
        - `Delete(id)` retorna `404 Not Found` con `{ "mensaje": "No se encontró la nota de audio con Id {id} para eliminar." }`.
        - `Update(id, dto)` retorna `404 Not Found` con `{ "mensaje": "No se encontró la nota de audio con Id {id} para actualizar." }`.
        - `Create(dto)` retorna `400 Bad Request` con `{ "mensaje": "El título de la nota no puede estar vacío." }` o `{ "mensaje": "La frecuencia en Hertz debe ser un valor mayor a 0." }` (compartido con `Update`).
  3. **Excepciones no Controladas (500) `[FACT]`:**
     - No existe un middleware global de manejo de excepciones (`UseExceptionHandler` o filtro personalizado). Los errores no capturados retornarán el comportamiento estándar del pipeline de ASP.NET Core.

---

## 6. Configuración de CORS

- **Política Actual: `"AllowAll"` `[FACT]`:**
  Implementada en `Program.cs` (líneas 20-28 y 79):
  ```csharp
  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowAll", policy =>
      {
          policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
      });
  });
  ...
  app.UseCors("AllowAll");
  ```
- **Compatibilidad con Frontend `[FACT]`:**
  La política actual ya autoriza peticiones cross-origin desde cualquier puerto u origen (por ejemplo, `http://localhost:5173` de Vite o URLs de producción). No provocará bloqueos de CORS para llamadas estándar sin cookies.

---

## 7. OpenAPI y Swagger

- **Exposición y Rutas `[FACT]`:**
  - Paquete: `Swashbuckle.AspNetCore` v6.5.0.
  - Entornos habilitados: Se encuentra activo de manera incondicional si el entorno es `Development`, `Production` o `Staging` (`Program.cs` L68).
  - Interfaz gráfica Swagger UI: `/swagger` (adicionalmente la raíz `/` redirige vía HTTP 302 a `/swagger`).
  - Especificación OpenAPI JSON: `/swagger/v1/swagger.json`.
  - Título y versión: `"Bitácora de Sesiones & Audio Log API"`, versión `"v1"`.

---

## 8. Convenciones de Nombrado y Serialización

- **Serializador: `System.Text.Json` (por defecto en ASP.NET Core 8) `[FACT]`:**
  - Convención JSON: **`camelCase`**.
  - Mapeo de propiedades de `NotaAudio`:
    - `Id` -> `id`
    - `Titulo` -> `titulo`
    - `Etiqueta` -> `etiqueta`
    - `FrecuenciaHz` -> `frecuenciaHz`
    - `FechaCreacion` -> `fechaCreacion`
    - `FechaModificacion` -> `fechaModificacion` (nullable)
  - Respuestas de error personalizadas: propiedad en minúsculas: `mensaje`.
  - Diccionario de errores en `ValidationProblemDetails`: nombres de campo con la mayúscula original del DTO (`Titulo`, `FrecuenciaHz`).

---

## 9. Puertos y Ejecución

- **Docker Container `[FACT]`:** Expuesto en puerto `8080` vía `ENV ASPNETCORE_HTTP_PORTS=8080`.
- **Ejecución Local (`dotnet run`) `[UNKNOWN]`:** Al no existir `launchSettings.json`, depende de las variables de entorno de la máquina o del puerto por defecto de Kestrel (`http://localhost:5000` / `https://localhost:5001`).
