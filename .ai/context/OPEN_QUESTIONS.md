# Preguntas Abiertas, Suposiciones y Decisiones Pendientes

> Este documento consolida todos los aspectos no confirmados del backend (`[UNKNOWN]` y `[ASSUMPTION]`) y las decisiones arquitectónicas propuestas para el frontend (`[DECISION]`) que requieren validación explícita del usuario antes de comenzar a generar código de React.

---

## 1. Dudas del Backend (Auditoría Técnica)

### 1.1 Autenticación y Seguridad
- **`[UNKNOWN]` ¿Se agregará autenticación al backend o el sistema permanecerá abierto?**
  - *Evidencia:* Actualmente ningún endpoint tiene autenticación (`[FACT]`). No hay esquemas JWT ni Identity configurados.
  - *Impacto en Frontend:* Si se mantendrá abierto, el frontend arranca directamente a la pantalla de bitácora sin login. Si se planea agregar autenticación pronto, conviene definir si será JWT Bearer con refresh token, cookies seguras o un proveedor OAuth2/OIDC.

### 1.2 Paginación y Crecimiento de Datos
- **`[UNKNOWN]` ¿Se mantendrá `GET /api/notasaudio` devolviendo todos los registros o se implementará paginación en el servidor?**
  - *Evidencia:* Actualmente devuelve la lista completa (`ToListAsync()`) sin `take`, `skip` ni `page`.
  - *Impacto en Frontend:* Si la base supera cientos de registros, se necesitará paginación o virtualización en el frontend.

### 1.3 Almacenamiento y Naturaleza del Audio
- **`[UNKNOWN]` ¿El sistema siempre manejará el audio como síntesis de frecuencias (Hz) o habrá subida de archivos binarios (WAV/MP3)?**
  - *Evidencia:* La entidad `NotaAudio` únicamente almacena metadatos y un valor numérico `FrecuenciaHz`.
  - *Impacto en Frontend:* Condiciona si el frontend solo necesita un oscilador de Web Audio API o si requerirá reproductores de audio HTML5 (`<audio>`), almacenamiento de blobs y formularios multipart con `FormData`.

### 1.4 Evolución de la Base de Datos y Migraciones
- **`[UNKNOWN]` ¿Cómo se gestionará el esquema de PostgreSQL en producción?**
  - *Evidencia:* `Program.cs` utiliza `context.Database.EnsureCreated()`. No hay migraciones de EF Core creadas en el código.
  - *Impacto:* `EnsureCreated()` no admite migraciones incrementales. Si se altera el modelo `NotaAudio`, no modificará tablas existentes sin recrearlas.

### 1.5 Infraestructura y Despliegue
- **`[UNKNOWN]` ¿Dónde está el archivo `docker-compose.yml` mencionado en `CONTEXT.md`?**
  - *Evidencia:* En la raíz del repositorio no existe `docker-compose.yml`, a pesar de que `CONTEXT.md` menciona "orquestado con Docker Compose".
- **`[UNKNOWN]` ¿Cuáles serán los dominios/URLs de Homologación y Producción?**
  - *Evidencia:* `CONTEXT.md` los menciona como entornos aislados con despliegue CI/CD, pero no hay archivos de configuración o GitHub Actions en el repositorio actual.
- **`[UNKNOWN]` Puerto local predeterminado de Kestrel:**
  - *Evidencia:* No existe `Properties/launchSettings.json`. El puerto al correr `dotnet run` depende de la configuración del entorno local. En Docker está fijado en `8080`.

---

## 2. Decisiones de Arquitectura Frontend (Pendientes de Aprobación)

Por favor, revisá y confirmá cada una de las siguientes propuestas antes de iniciar la construcción del frontend:

### Decisión F-01: Stack y Herramientas Base
- **Propuesta:** React 18/19 con TypeScript sobre Vite, montado en el directorio `/frontend`.
- **Estado:** `[DECISION - PENDIENTE]`
- **Opciones:**
  - [A] Aprobar Vite + React + TypeScript en `/frontend`. *(Recomendada)*
  - [B] Usar Next.js u otro framework alternativo.

### Decisión F-02: Gestión de Estado Asíncrono y Red
- **Propuesta:** **TanStack Query (React Query v5)** + cliente `fetch` nativo tipado.
- **Estado:** `[DECISION - PENDIENTE]`
- **Justificación:** El backend es un CRUD REST simple sin refresh tokens. TanStack Query maneja caché, invalidación automática y reintentos sin el overhead de Redux.
- **Opciones:**
  - [A] Aprobar TanStack Query + Fetch. *(Recomendada)*
  - [B] Usar RTK Query / Redux Toolkit.
  - [C] Usar Axios plano con estados locales `useState` / `useEffect`.

### Decisión F-03: Motor de Audio y Síntesis Sonora
- **Propuesta:** Módulo dedicado con Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) gestionado mediante Custom Hook (`useToneGenerator`) y store de control con **Zustand**.
- **Estado:** `[DECISION - PENDIENTE]`
- **Capacidades propuestas:** Reproducción/detención de la frecuencia en Hz indicada en la nota, selector de forma de onda (senoidal, cuadrada, triangular, sierra), control de ganancia y canvas con osciloscopio visual.
- **Opciones:**
  - [A] Aprobar Web Audio API nativa + Zustand + visualizador canvas. *(Recomendada)*
  - [B] Reproducción mínima simple sin visualizador ni formas de onda adicionales.

### Decisión F-04: Estrategia de Tipado TypeScript
- **Propuesta:** Generación automática de tipos con **`openapi-typescript`** apuntando al endpoint de Swagger del backend (`http://localhost:8080/swagger/v1/swagger.json`), con fallback estático sincronizado en `src/types/index.ts` basado en `API_CONTRACT.md`.
- **Estado:** `[DECISION - PENDIENTE]`
- **Opciones:**
  - [A] Aprobar `openapi-typescript` + fallback manual. *(Recomendada)*
  - [B] Solo tipado manual basado en `API_CONTRACT.md`.

### Decisión F-05: Sistema de Diseño y Estilos
- **Propuesta:** **Vanilla CSS con Design Tokens** estructurados (variables CSS para temas, paleta acústica oscura, componentes limpios sin librerías pesadas) o **TailwindCSS**.
- **Estado:** `[DECISION - PENDIENTE]`
- **Opciones:**
  - [A] Vanilla CSS puro con tokens y microanimaciones modernas. *(Recomendada para máximo control y ligereza)*
  - [B] TailwindCSS.
  - [C] Librería de componentes (ej: Shadcn UI, Chakra UI, MUI).
