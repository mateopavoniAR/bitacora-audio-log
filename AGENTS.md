# Guía de Contexto Operativo para Agentes de IA

## Descripción General del Proyecto
**Bitácora de Sesiones & Audio Log** es un sistema fullstack desarrollado en el marco del programa de Onboarding (Niveles 1 y 2). Su objetivo es registrar, catalogar y gestionar notas de audio y frecuencias de prueba acústica en Hertz (`NotaAudio`), permitiendo su posterior reproducción y calibración en el cliente mediante la Web Audio API.

## Stack Tecnológico
- **Backend (.NET):** .NET 8 Web API (`BitacoraAudio.Api`), Entity Framework Core 8.0, PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`), Swashbuckle OpenAPI/Swagger (`Swashbuckle.AspNetCore` 6.5.0), xUnit para pruebas unitarias.
- **Frontend (React - Pendiente de construcción):** React + TypeScript sobre Vite, con consumo de la API REST e integración con la API nativa de Web Audio del navegador.
- **Persistencia e Infraestructura:** PostgreSQL (esquema `notas_audio`), Dockerfile multi-stage, orquestación prevista con Docker Compose.

## Comandos Esenciales

### Backend
```bash
# Compilar la solución completa (API + Tests)
dotnet build backend/Backend.sln

# Ejecutar suite de pruebas unitarias xUnit (20 tests existentes)
dotnet test backend/Backend.sln

# Ejecutar API REST en desarrollo local
# (Opcional: configurar DATABASE_URL con conexión a PostgreSQL)
dotnet run --project backend/BitacoraAudio.Api.csproj

# Construir y correr contenedor Docker
docker build -t bitacora-backend:latest -f backend/Dockerfile backend/
docker run -p 8080:8080 -e DATABASE_URL="postgres://usuario:clave@host.docker.internal:5432/bitacora_db" bitacora-backend:latest
```

### Frontend (Futuro)
```bash
# Instalación de dependencias (cuando se inicialice en /frontend)
npm install

# Servidor de desarrollo local
npm run dev

# Compilación y verificación de tipos
npm run build
```

## Convenciones Críticas y Reglas de Oro
1. **Serialización JSON:** El backend serializa en **`camelCase`** mediante `System.Text.Json` (`id`, `titulo`, `etiqueta`, `frecuenciaHz`, `fechaCreacion`). Todo contrato entre frontend y backend debe respetar esta convención.
2. **Formato de Fechas:** Estándar ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
3. **Estado de Autenticación:** Actualmente la API **NO implementa autenticación ni autorización**. Todos los endpoints (`/api/notasaudio`, `/health`) son públicos. No bloquear peticiones del cliente esperando tokens salvo que se indique lo contrario.
4. **Formato de Respuestas de Error:** Coexisten dos formatos:
   - Errores de validación de modelo (`400 Bad Request`): Devuelven `ValidationProblemDetails` RFC 7807/9110 con diccionario de `errors`.
   - Errores de negocio/controlador (`404 Not Found` o `400 manual`): Devuelven `{ "mensaje": "..." }`.
5. **CORS:** Política activa `"AllowAll"` (permite cualquier origen, método y encabezado).
6. **No Modificar Código de Aplicación Sin Plan:** Todo cambio debe estar fundamentado en las especificaciones de `.ai/context/`.

## Para Más Contexto
Según la tarea a realizar, consultá primero el documento correspondiente en `.ai/context/`:
- **Para trabajar en el frontend o consumir la API:** leé [.ai/context/API_CONTRACT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/API_CONTRACT.md).
- **Para decisiones arquitectónicas del frontend React:** leé [.ai/context/FRONTEND_ARCHITECTURE.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/FRONTEND_ARCHITECTURE.md).
- **Para modificar o auditar el backend .NET:** leé [.ai/context/ARCHITECTURE.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/ARCHITECTURE.md).
- **Para revisar normas de código, nombrado y Git:** leé [.ai/context/CONVENTIONS.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/CONVENTIONS.md).
- **Para entender el negocio, actores y alcance:** leé [.ai/context/PROJECT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/PROJECT.md).
- **Para revisar dudas pendientes y decisiones no confirmadas:** leé [.ai/context/OPEN_QUESTIONS.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/OPEN_QUESTIONS.md).
