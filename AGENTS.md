# Guía de Contexto Operativo para Agentes de IA

## Descripción General del Proyecto
**Bitácora de Sesiones & Audio Log** es un sistema fullstack desarrollado en el marco del programa de Onboarding (Niveles 1 y 2). Su objetivo es registrar, catalogar y gestionar notas de audio y frecuencias de prueba acústica en Hertz (`NotaAudio`), permitiendo su reproducción y calibración en el cliente mediante la Web Audio API.

## Stack Tecnológico
- **Backend (.NET):** .NET 8 Web API (`BitacoraAudio.Api`), Entity Framework Core 8.0, PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`), Swashbuckle OpenAPI/Swagger (`Swashbuckle.AspNetCore` 6.5.0), xUnit para pruebas unitarias.
- **Frontend (React):** React 19 + TypeScript sobre Vite 8, estética retro analógica (rojo/marfil con variables CSS), consumo REST con Fetch API nativo y síntesis con Web Audio API (`AudioContext`).
- **Persistencia e Infraestructura:** PostgreSQL (tabla `notas_audio`), Dockerfiles multi-stage para Backend y Frontend con Nginx, orquestación prevista con Docker Compose.

## Comandos Esenciales

### Backend (.NET 8)
```bash
# Compilar la solución completa (API + Tests)
dotnet build backend/Backend.sln

# Ejecutar suite de pruebas unitarias xUnit (20 tests existentes)
dotnet test backend/Backend.sln

# Ejecutar API REST en desarrollo local
dotnet run --project backend/BitacoraAudio.Api.csproj

# Construir y correr contenedor Docker del backend
docker build -t bitacora-backend:latest -f backend/Dockerfile backend/
docker run -p 8080:8080 -e DATABASE_URL="postgres://usuario:clave@host.docker.internal:5432/bitacora_db" bitacora-backend:latest
```

### Frontend (React + Vite)
```bash
# Instalación de dependencias
cd frontend && npm install

# Servidor de desarrollo local (Vite HMR en http://localhost:5173)
cd frontend && npm run dev

# Compilación y verificación estricta de tipos TypeScript
cd frontend && npm run build

# Previsualizar el build de producción localmente
cd frontend && npm run preview

# Construir y correr contenedor Docker del frontend (Nginx en puerto 80)
docker build -t bitacora-frontend:latest -f frontend/Dockerfile frontend/
docker run -p 80:80 bitacora-frontend:latest
```

## Convenciones Críticas y Reglas de Oro
1. **Serialización JSON:** El backend serializa en **`camelCase`** mediante `System.Text.Json` (`id`, `titulo`, `etiqueta`, `frecuenciaHz`, `fechaCreacion`). Todo contrato entre frontend y backend debe respetar esta convención.
2. **Formato de Fechas:** Estándar ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
3. **Estado de Autenticación:** Actualmente la API **NO implementa autenticación ni autorización**. Todos los endpoints (`/api/notasaudio`, `/health`) son públicos. No bloquear peticiones del cliente esperando tokens.
4. **Formato de Respuestas de Error:** Coexisten dos formatos:
   - Errores de validación de modelo (`400 Bad Request`): Devuelven `ValidationProblemDetails` RFC 7807/9110 con diccionario de `errors`.
   - Errores de negocio/controlador (`404 Not Found` o `400 manual`): Devuelven `{ "mensaje": "..." }`.
5. **CORS:** Política activa `"AllowAll"` (permite cualquier origen, método y encabezado).
6. **No Modificar Código de Aplicación Sin Plan:** Todo cambio debe estar fundamentado en las especificaciones de `.ai/context/`.

## Para Más Contexto
Según la tarea a realizar, consultá primero el documento correspondiente en `.ai/context/`:
- **Para consultar contratos de endpoints y DTOs:** leé [.ai/context/API_CONTRACT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/API_CONTRACT.md).
- **Para entender la arquitectura y componentes del frontend:** leé [.ai/context/FRONTEND_ARCHITECTURE.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/FRONTEND_ARCHITECTURE.md).
- **Para modificar o auditar el backend .NET:** leé [.ai/context/ARCHITECTURE.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/ARCHITECTURE.md).
- **Para revisar normas de código, nombrado y Git:** leé [.ai/context/CONVENTIONS.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/CONVENTIONS.md).
- **Para entender el negocio, actores y alcance:** leé [.ai/context/PROJECT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/PROJECT.md).
- **Para revisar dudas pendientes sobre backend y DevOps:** leé [.ai/context/OPEN_QUESTIONS.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/OPEN_QUESTIONS.md).
