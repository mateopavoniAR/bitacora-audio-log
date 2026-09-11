# Bitácora de Sesiones & Audio Log

Sistema fullstack para el registro, catalogación y gestión de **notas de audio y frecuencias de prueba acústica** (Hz): permite crear, editar, eliminar y reproducir tonos mediante la Web Audio API. Proyecto desarrollado dentro del programa de Onboarding (Niveles 1 y 2).

Construido con estética retro analógica de consola (rojo/marfil), arquitectura BFF y desplegado en entornos aislados de **Testing** y **Producción** en la nube.

---

## Desplegado en la Nube (Vercel + Render + Neon)

El proyecto está publicado en tres servicios gratuitos, sin modificar el código entre entornos:

| Capa | Tecnología | Testing («homologacion») | Producción («produccion») |
|------|------------|--------------------------|---------------------------|
| **Frontend SPA** | Vercel | https://bitacora-audio-log-git-homologacion-mateopavoni-ar.vercel.app/ | https://bitacora-audio-log-git-produccion-mateopavoni-ar.vercel.app/ |
| **Backend API** | Render | https://bitacora-audio-test.onrender.com | https://bitacora-audio-log.onrender.com |
| **Base de Datos** | Neon.tech | Database `bitacora_test` | Database `bitacora_prod` |

- **Healthcheck:** `GET /health` en cada backend (p. ej. `https://bitacora-audio-log.onrender.com/health`) devuelve `status`, `environment` y `timestamp`.
- **Keep-Alive:** servicios de Render en plan free **duermen** por inactividad; se mantienen despiertos con pings automáticos vía **Cron-Job.org** cada 10 minutos.
- **Variables de entorno por entorno:** backend usa `DATABASE_URL` (URI de Neon) y `ALLOWED_ORIGINS`; frontend usa `VITE_API_URL` inyectada en el build de Vercel.

---

## Stack Tecnológico

- **Backend (.NET 8):** Web API REST, Entity Framework Core 8 con Npgsql (PostgreSQL), Swagger/OpenAPI, xUnit (tests unitarios).
- **Frontend (React 19 + Vite):** TypeScript, Fetch API nativa, Web Audio API (`AudioContext`) para síntesis de tonos, estética retro analógica con variables CSS.
- **Persistencia e Infraestructura:** PostgreSQL 16, Dockerfiles multi-stage, orquestación local con Docker Compose.
- **Despliegue:** Vercel, Render y Neon (guía en `docs/DEPLOYMENT_ENVIRONMENTS.md`).

---

## Ejecución Local (Docker Compose)

```bash
docker compose up -d --build
```

| Servicio | URL |
|----------|-----|
| Frontend (Nginx) | http://localhost:80 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| PostgreSQL | localhost:5432 |

O en desarrollo sin contenedores:

```bash
dotnet run --project backend/BitacoraAudio.Api.csproj   # API en :8080
cd frontend && npm install && npm run dev               # Vite en :5173
```

---

## Estructura

```
backend/     API .NET 8 + Entity Framework Core + tests xUnit
frontend/    SPA React 19 + Vite + TypeScript (Dockerfile, vercel.json)
docs/        Guías de despliegue multientorno
.ai/context/ Ingeniería de contexto operativo (contratos, arquitectura, convenciones)
docker-compose.yml
```

---

## Documentación

- Despliegue multientorno (Neon / Render / Vercel / Cron-Job): [`docs/DEPLOYMENT_ENVIRONMENTS.md`](docs/DEPLOYMENT_ENVIRONMENTS.md)
- Contrato de API y DTOs: `.ai/context/API_CONTRACT.md`
- Arquitectura del backend: `.ai/context/ARCHITECTURE.md`
- Arquitectura del frontend: `.ai/context/FRONTEND_ARCHITECTURE.md`
- Normas y convenciones: `.ai/context/CONVENTIONS.md`
- README técnico del backend: [`backend/README.md`](backend/README.md)
- README técnico del frontend: [`frontend/README.md`](frontend/README.md)