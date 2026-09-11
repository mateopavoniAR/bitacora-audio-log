# Despliegue Multientorno: Testing (Staging) y Producción

Esta guía explica cómo desplegar la **Bitácora de Sesiones & Audio Log** en dos entornos independientes usando proveedores gratuitos. No hace falta modificar código fuente entre entornos: cada entorno se configura con variables de entorno propias.

---

## 1. Arquitectura de Entornos

| Entorno    | Rama Git | Frontend (Vercel) | Backend (Render)   | Base de Datos (Neon) |
|------------|----------|-------------------|--------------------|----------------------|
| **Testing** | `desarrollo` | Preview Domain    | `bitacora-api-test` | Database `bitacora_test` |
| **Producción** | `main` | Production Domain | `bitacora-api-prod` | Database `bitacora_prod` |

El código es idéntico en ambos entornos. Lo único que cambia son las **variables de entorno**:

- Backend: `DATABASE_URL`, `ALLOWED_ORIGINS`, `ASPNETCORE_ENVIRONMENT`.
- Frontend: `VITE_API_URL` (inyectada en build). No es "secreta": es la URL pública del backend.

---

## 2. Backend (.NET 8) — Lectura Dinámica de Configuración

El backend ya soporta multientorno sin cambios de código:

1. **`DATABASE_URL` flexible** (`backend/Data/ConnectionStringHelper.cs`):
   - Si se provee en formato URI (`postgres://user:password@host:port/dbname`) se normaliza a una cadena de conexión Npgsql automáticamente.
   - También acepta formato ADO.NET (`Host=...;Database=...;Username=...;Password=...`).
   - **SSL:** se fuerza `SSL Mode=Require` (con `Trust Server Certificate=true`) cuando el entorno no es `Development` y el host no es `localhost`. En desarrollo local o `localhost` se usa `SSL Mode=Prefer`.

2. **CORS dinámico** (`backend/Program.cs`):
   - Si la variable `ALLOWED_ORIGINS` no está definida (o vale `*`) se permite cualquier origen (comportamiento de desarrollo local).
   - Si está definida (separada por comas), se permite la lista indicada **más** los orígenes de desarrollo `http://localhost:*` y los comodines de Vercel `https://*.vercel.app` (incluye `https://<proyecto>.vercel.app` y sus previews).

3. **Healthcheck / Keep-Alive** (`GET /health`):
   - Respuesta `200 OK` en JSON: `status`, `environment`, `timestamp`. Ideal para liveness de Render y pings de Cron-Job.

---

## 3. Frontend (React + Vite) — Configuración por Entorno

1. **API Target dinámico** (`frontend/src/services/api.ts`):
   - `const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'`.
   - En Vercel se define `VITE_API_URL` por entorno y se inyecta en el build. No hace falta recompilar manualmente.

2. **Ruteo SPA en Vercel** (`frontend/vercel.json`):
   - `rewrites` envían cualquier ruta a `/index.html` para que el enrutamiento de la SPA funcione en todas las vistas previas y en producción.

---

## 4. Preparación de Base de Datos en Neon.tech

1. Crear una cuenta en [Neon](https://neon.tech) (plan gratuito).
2. Crear **dos proyectos/bases** independientes:
   - `bitacora_test` → entorno de testing.
   - `bitacora_prod` → entorno de producción.
3. Desde el dashboard de cada base copiar la **connection string** en formato URI (pestaña *Connect* → *Psql* respeta el formato `postgres://...`). Ejemplo:

   ```
   postgres://usuario:clave@ep-jardel-123.us-east-2.aws.neon.tech/bitacora_test?sslmode=require
   ```

   Usar **cada cadena con su propia URL** como `DATABASE_URL` en Render.

---

## 5. Despliegue del Backend en Render

### A. Entorno de Testing
1. **New Web Service** → conectar el repositorio de GitHub.
2. Configuración:
   - **Branch:** `desarrollo`
   - **Name:** `bitacora-api-test`
   - **Environment:** .NET (`Docker`)
   - **Root Directory:** `backend` (si se usa Dockerfile) o configurar el build nativo.
   - **Build Command:** `dotnet publish -c Release`
3. **Environment Variables:**
   - `DATABASE_URL` = connection string de `bitacora_test` (Neon).
   - `ALLOWED_ORIGINS` = `https://bitacora-test.vercel.app,https://bitacora-test-git-main.vercel.app`
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `ASPNETCORE_HTTP_PORTS` = `8080`
4. Deploy y verificar: `https://bitacora-api-test.onrender.com/health`.

### B. Entorno de Producción
Igual que Testing pero:
   - **Branch:** `main`
   - **Name:** `bitacora-api-prod`
   - `DATABASE_URL` = connection string de `bitacora_prod`.
   - `ALLOWED_ORIGINS` = el dominio de producción de Vercel.
   - Verificar: `https://bitacora-api-prod.onrender.com/health`.

> Free tier de Render: los servicios **duermen** tras inactividad (~15 min). Usar la estrategia de Keep-Alive de la Sección 7.

---

## 6. Despliegue del Frontend en Vercel

### A. Entorno de Testing
1. **New Project** → importar el repositorio.
2. Configuración:
   - **Root Directory:** `frontend`
   - **Rama asociada al preview:** `desarrollo`
3. **Environment Variables (del entorno de preview):**
   - `VITE_API_URL` = `https://bitacora-api-test.onrender.com`
4. Vercel servirá una URL de vista previa tipo `https://<proyecto>-<hash>.vercel.app`.

### B. Entorno de Producción
1. Configurar la **rama de producción** en `main`.
2. **Environment Variables (producción):**
   - `VITE_API_URL` = `https://bitacora-api-prod.onrender.com`
3. Deploy y verificar el dominio de producción `https://<proyecto>.vercel.app`.

> `frontend/vercel.json` ya resuelve el ruteo SPA: cualquier ruta cae en `index.html`.

---

## 7. Keep-Alive (Ping Automático) con Cron-Job.org

El free tier de Render suspende el servicio tras inactividad. Para mantenerlos despiertos:

1. Crear cuenta en [Cron-Job.org](https://cron-job.org) (gratuito).
2. Crear **dos cron-jobs independientes**, cada uno con un endpoint distinto:

| Cron-Job | URL a pingear | Frecuencia |
|----------|---------------|------------|
| Keep-Alive Testing    | `https://bitacora-api-test.onrender.com/health`  | Cada 10 min |
| Keep-Alive Producción | `https://bitacora-api-prod.onrender.com/health`  | Cada 10 min |

3. Configurar *Retries* (p. ej. 3 reintentos con intervalo de 1 min) para recuperarse del primer wake-up.

---

## 8. Prerrequisitos en el Repositorio

- El backend ya incluye el endpoint `/health` para liveness.
- `Program.cs` lee `DATABASE_URL` (URI o ADO.NET) y `ALLOWED_ORIGINS` por entorno.
- `frontend/src/services/api.ts` usa `import.meta.env.VITE_API_URL` con fallback local.
- `frontend/vercel.json` habilita el ruteo SPA en Vercel.