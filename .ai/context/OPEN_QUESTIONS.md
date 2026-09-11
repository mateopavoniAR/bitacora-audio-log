# Preguntas Abiertas, Suposiciones y Estado de Decisiones

> Este documento registra el estado de las decisiones arquitectónicas del sistema, marcando aquellas resueltas durante las Fases de implementación y manteniendo visibles las incógnitas pendientes del backend y de infraestructura.

---

## 1. Decisiones de Frontend y Cliente Web (Fases 1, 2 y 3)

### Decisión F-01: Stack Base y Herramientas
- **Estado:** `[RESUELTO]`
- **Resolución:** Implementado en `/frontend` utilizando **React 19 + Vite 8 + TypeScript**.
- **Evidencia:** Archivos de configuración [vite.config.ts](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/vite.config.ts), [package.json](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/package.json) y compilación exitosa.

### Decisión F-02: Gestión de Red y Consumo de API
- **Estado:** `[RESUELTO]`
- **Resolución:** Implementado mediante un cliente **Fetch API nativo tipado** en [services/api.ts](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/services/api.ts).
- **Manejo de Errores:** Resuelve de forma unificada tanto el estándar RFC 7807 (`errors`) como mensajes directos de controladores (`mensaje`).
- **Configuración de URL:** Resuelto mediante la variable `import.meta.env.VITE_API_URL` con fallback automático a `http://localhost:8080`.

### Decisión F-03: Motor de Audio y Síntesis Sonora
- **Estado:** `[RESUELTO]`
- **Resolución:** Implementado en [utils/audioSynth.ts](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/utils/audioSynth.ts) utilizando la **Web Audio API nativa** (`AudioContext`, `OscillatorNode`, `GainNode`).
- **Capacidades:** Emisión de onda senoidal pura a la frecuencia en Hz indicada, con envolvente suave para evitar chasquidos acústicos y protección de altavoces.

### Decisión F-04: Estrategia de Tipado TypeScript
- **Estado:** `[RESUELTO]`
- **Resolución:** Tipado estricto derivado directamente de [.ai/context/API_CONTRACT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/API_CONTRACT.md) en [types/notaAudio.ts](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/types/notaAudio.ts) (`NotaAudio`, `CreateNotaAudioDto`, `ValidationProblemDetails`, `ApiErrorMessage`, `HealthStatus`).

### Decisión F-05: Sistema de Diseño y Estilos
- **Estado:** `[RESUELTO]`
- **Resolución:** **Vanilla CSS con Design Tokens y Variables CSS** en [index.css](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/index.css) y [App.css](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/App.css).
- **Estética:** Paleta retro de consola analógica en rojo audaz (`#D32F2F` / `#B71C1C`) y blanco/marfil (`#FAF7F2` / `#FFFFFF`), tipografía monoespaciada para Hz y sombras mecánicas duras (`3px 3px 0px #1C1917`).

### Decisión F-06: Contenedorización del Frontend
- **Estado:** `[RESUELTO]`
- **Resolución:** Construcción multi-stage en [Dockerfile](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/Dockerfile) (Node 20 Alpine para build + Nginx Alpine para runtime) con soporte SPA en [nginx.conf](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/nginx.conf).

### Decisión F-07: Refactor de UX/UI (Paginación, Modales, Notificaciones y Edición)
- **Estado:** `[RESUELTO]`
- **Resolución:** Refactor integral de experiencia de usuario implementado en [components](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/components):
  - **Eliminación:** Se eliminó `window.confirm` nativo en favor del modal retro [ConfirmModal.tsx](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/components/ConfirmModal.tsx).
  - **Edición:** Nuevo [EditNotaModal.tsx](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/components/EditNotaModal.tsx) que consume `PUT /api/notasaudio/{id}` y muestra la marca "Editado: [fecha/hora]" en las tarjetas.
  - **Paginación:** Paginación local en cliente (4 notas por página) en [NotaList.tsx](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/components/NotaList.tsx) con controles retro.
  - **Notificaciones:** Componente auto-dismiss [AutoDismissAlert.tsx](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/frontend/src/components/AutoDismissAlert.tsx) (4 s) para feedback de crear/editar/eliminar.
  - **Limpieza visual:** Cabecera simplificada sin subtítulo, sin punto rojo decorativo y sin badge "OSC-01"; botones de calibración con mayor espaciado.

---

## 2. Dudas e Incógnitas Pendientes (Backend y DevOps)

### 2.1 Autenticación y Seguridad
- **`[UNKNOWN]` ¿Se agregará autenticación en una fase posterior o el backend permanecerá público?**
  - *Estado actual:* La API es 100% pública. No requiere tokens ni cabeceras `Authorization`.
  - *Impacto:* Si se agrega JWT en el futuro, el cliente `api.ts` podrá incorporar un interceptor de autorización sin alterar las vistas.

### 2.2 Paginación y Filtrado en Servidor
- **`[UNKNOWN]` ¿Se agregará paginación al endpoint `GET /api/notasaudio`?**
  - *Estado actual:* Devuelve el conjunto completo ordenado por fecha descendente. **El frontend ya implementa paginación local en memoria** (4 notas por página en `NotaList.tsx`). Para el volumen actual la paginación en cliente es la opción elegida.

### 2.3 Evolución de la Base de Datos y Migraciones
- **`[RESUELTO]` ¿Se mantendrá `context.Database.EnsureCreated()` o se inicializará EF Core Migrations?**
  - *Resolución:* Se mantiene `EnsureCreated()` y se incorporó una **sincronización aditiva idempotente** en `Program.cs` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS fecha_modificacion ...`). De esta forma las bases existentes creadas por `EnsureCreated()` reciben la columna nueva al arrancar, sin perder datos ni recrear volúmenes.
  - *Migración EF:* La migración `AddFechaModificacion` existe como documentación evolutiva del esquema, pero no se aplica vía `Database.Migrate()`.

### 2.4 Infraestructura y Orquestación Local
- **`[RESUELTO]` Creación del `docker-compose.yml` en la raíz:**
  - *Resolución:* Orquestación implementada (`db` PostgreSQL 16 + `backend` .NET en puerto 8080 + `frontend` Nginx en puerto 80).
- **`[RESUELTO]` Preparación de código multientorno (Testing & Producción):**
  - *Resolución:* El backend lee `DATABASE_URL` (URI o ADO.NET, con `SSL Mode=Require` fuera de Development salvo hosts locales), aplica CORS dinámico según `ALLOWED_ORIGINS` y expone `/health` con `status`, `environment` y `timestamp`. El frontend usa `import.meta.env.VITE_API_URL` con fallback a `http://localhost:8080` y `frontend/vercel.json` resuelve el ruteo SPA en Vercel. Ver [docs/DEPLOYMENT_ENVIRONMENTS.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/docs/DEPLOYMENT_ENVIRONMENTS.md).
- **`[UNKNOWN]` Pipelines de CI/CD para GitHub Actions:**
  - *Pendiente:* Configurar los workflows automatizados para testeo y despliegue continuo hacia las ramas `main` (producción) y `desarrollo` (testing).
