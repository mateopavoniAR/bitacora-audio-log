# Bitácora de Sesiones & Audio Log - Backend

API REST desarrollada en **.NET 8** y **Entity Framework Core** para el registro y gestión de notas de audio y frecuencias de prueba (`NotaAudio`), con persistencia en **PostgreSQL**.

---

## Estructura del Módulo

```text
/backend
├── Controllers/
│   └── NotasAudioController.cs      # Endpoints GET, POST, DELETE en /api/notasaudio
├── Data/
│   ├── AppDbContext.cs              # Contexto de persistencia EF Core para PostgreSQL
│   └── ConnectionStringHelper.cs    # Normalizador de DATABASE_URL (URI y ADO.NET)
├── DTOs/
│   └── CreateNotaAudioDto.cs        # DTO de entrada con validaciones DataAnnotations
├── Models/
│   └── NotaAudio.cs                 # Entidad de dominio con reglas de validación
├── tests/
│   ├── BitacoraAudio.Tests.csproj   # Proyecto xUnit para testing unitario
│   ├── NotaAudioTests.cs            # Tests de instanciación y validación de NotaAudio
│   └── ConnectionStringHelperTests.cs# Tests del parser de conexión DATABASE_URL
├── appsettings.json                 # Configuración y fallback de conexión local
├── Backend.sln                      # Solución .NET que agrupa API y Tests
├── BitacoraAudio.Api.csproj         # Proyecto Web API .NET 8
├── Dockerfile                       # Multi-stage build optimizado expuesto en puerto 8080
└── .dockerignore                    # Exclusiones de contexto para compilación Docker
```

---

## Endpoints de la API

Base URL: `/api/notasaudio`

| Método | Ruta | Descripción | Código de Éxito |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notasaudio` | Obtiene todas las notas de audio registradas (ordenadas cronológicamente descendente). | `200 OK` |
| **GET** | `/api/notasaudio/{id}` | Obtiene el detalle de una nota de audio por su ID. | `200 OK` (o `404 Not Found`) |
| **POST** | `/api/notasaudio` | Registra una nueva nota de audio validando título y frecuencia en Hz. | `201 Created` |
| **DELETE** | `/api/notasaudio/{id}` | Elimina una nota de audio existente por su ID. | `204 No Content` (o `404 Not Found`) |
| **GET** | `/health` | Healthcheck básico del servicio. | `200 OK` |
| **GET** | `/swagger` | Documentación interactiva Swagger UI. | `200 OK` |

---

## Variables de Entorno

- **`DATABASE_URL`**: Cadena de conexión a PostgreSQL. Acepta formato URI estándar (`postgres://user:password@host:port/database`) o formato ADO.NET (`Host=...;Database=...;Username=...;Password=...`).

---

## Ejecución Local

### Pruebas Unitarias (xUnit)
```bash
dotnet test backend/Backend.sln
```

### Ejecutar la API
```bash
# Definir variable de conexión (opcional si se usa el fallback de appsettings.json)
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/bitacora_db"

dotnet run --project backend/BitacoraAudio.Api.csproj
```

---

## Construcción con Docker

```bash
docker build -t bitacora-backend:latest -f backend/Dockerfile backend/
docker run -p 8080:8080 -e DATABASE_URL="postgres://usuario:clave@host.docker.internal:5432/bitacora_db" bitacora-backend:latest
```
