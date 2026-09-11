# Arquitectura Implementada del Frontend React

> **ESTADO DE ESTE DOCUMENTO: `[IMPLEMENTADO / CONGELADO]`**  
> Las decisiones arquitectónicas preliminares han sido consolidadas y construidas durante las Fases 1, 2 y 3 del Frontend. Este documento refleja el estado técnico real y la estructura implementada en `/frontend`.

---

## 1. Stack Tecnológico Implementado `[FACT]`

- **Runtime y Empaquetador:** **React 19 + Vite 8 + TypeScript** en `/frontend`.
  - Compilación optimizada mediante `tsc -b && vite build`.
  - Tipado estricto habilitado con TypeScript.
- **Consumo de API REST:** **Fetch API nativo tipado** centralizado en `/frontend/src/services/api.ts`.
  - URL base dinámica leída desde `import.meta.env.VITE_API_URL` con fallback predeterminado a `http://localhost:8080`.
  - Normalizador unificado de errores que soporta tanto el estándar RFC 7807 (`errors`) como mensajes personalizados de controladores (`mensaje`).
- **Motor de Audio:** **Web Audio API nativa** en `/frontend/src/utils/audioSynth.ts`.
  - Uso de `AudioContext` (compatible con `webkitAudioContext`).
  - Generación de ondas senoidales puras mediante `OscillatorNode` (`type = 'sine'`).
  - Envolvente de volumen mediante `GainNode` (ataque rápido a 0.2 y decaimiento exponencial) para supresión de chasquidos acústicos (clics).
- **Diseño y Estilos:** **Vanilla CSS con Design Tokens y Variables CSS** en `/frontend/src/index.css` y `App.css`.
  - Estética retro de instrumentación y consolas analógicas:
    - Chasis marfil cálido (`#FAF7F2`) y paneles blancos (`#FFFFFF`).
    - Acentos y bordes en rojo audaz (`#D32F2F` / `#B71C1C`).
    - Sombras analógicas mecánicas desplazadas (`3px 3px 0px #1C1917` / `#D32F2F`).
    - Display digital vintage (`.synth-display`) y tipografía monoespaciada para Hz (`.synth-hz-readout`).
- **Contenedorización y Servidor Web:** **Dockerfile multi-stage con Nginx en puerto 80**.
  - Etapa 1 (`node:20-alpine`): Instalación de dependencias y compilación de producción.
  - Etapa 2 (`nginx:alpine`): Servidor estático con configuración para Single Page Applications (`try_files $uri $uri/ /index.html;`) y caché de assets estáticos.

---

## 2. Estructura Real de Carpetas y Módulos `[FACT]`

```text
/frontend
├── public/                      # Favicons y recursos públicos
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                  # Logos y recursos gráficos
│   ├── components/              # Componentes de la interfaz de usuario
│   │   ├── NotaForm.tsx         # Formulario retro con validaciones en cliente y preview sonoro
│   │   ├── NotaList.tsx         # Listado en rack analógico con paginación local, reproducción, edición y eliminación (modales)
│   │   ├── AutoDismissAlert.tsx # Alerta temporal con auto-dismiss a los 4 s y transición suave
│   │   ├── ConfirmModal.tsx     # Modal retro de confirmación para eliminación (reemplaza window.confirm)
│   │   └── EditNotaModal.tsx    # Modal retro de edición que invoca PUT /api/notasaudio/{id}
│   ├── services/
│   │   └── api.ts               # Cliente HTTP para endpoints /api/notasaudio (GET/POST/PUT/DELETE) y /health
│   ├── types/
│   │   └── notaAudio.ts         # Contratos de tipos derivados de API_CONTRACT.md
│   ├── utils/
│   │   └── audioSynth.ts        # Helper de síntesis acústica con Web Audio API
│   ├── App.css                  # Estilos de layout y estructura de chasis analógico
│   ├── App.tsx                  # Componente raíz con orquestación, estados y oscilador superior
│   ├── index.css                # Variables CSS, reset, tipografía mono y componentes synth
│   └── main.tsx                 # Entrada de React y montaje en el DOM
├── .dockerignore                # Exclusiones de construcción para la imagen Docker
├── Dockerfile                   # Construcción multi-stage (Node 20 + Nginx Alpine)
├── index.html                   # HTML base de la aplicación
├── nginx.conf                   # Configuración del servidor Nginx para SPA
├── package.json                 # Dependencias y scripts de npm
├── tsconfig.json                # Configuración global de TypeScript
└── vite.config.ts               # Configuración del empaquetador Vite
```

---

## 3. Módulos y Flujos de Datos

### 3.1 Cliente de API (`src/services/api.ts`)
- **Base URL dinámica `[FACT]`:** `frontend/src/services/api.ts` exporta `API_BASE_URL` (`import.meta.env.VITE_API_URL` con fallback a `http://localhost:8080`), usado por las peticiones y por el banner de error de `App.tsx` (soporta Vercel en Testing/Producción sin recompilar código).
- **Ruteo SPA `[FACT]`:** `frontend/vercel.json` define los `rewrites` a `index.html` y, vía `ignoreCommand`, restringe los builds de Vercel únicamente a las ramas `homologacion` (preview) y `produccion` (production); `desarrollo` y demás ramas no generan despliegues.
Implementa las siguientes operaciones asíncronas:
- `getNotas(): Promise<NotaAudio[]>`: Consume `GET /api/notasaudio`.
- `createNota(dto: CreateNotaAudioDto): Promise<NotaAudio>`: Consume `POST /api/notasaudio`.
- `updateNota(id: number, dto: UpdateNotaAudioDto): Promise<NotaAudio>`: Consume `PUT /api/notasaudio/{id}` (asigna `fechaModificacion` en servidor).
- `deleteNota(id: number): Promise<void>`: Consume `DELETE /api/notasaudio/{id}`.
- `getHealth(): Promise<HealthStatus>`: Consume `GET /health`; `HealthStatus` incluye `status`, `environment` y `timestamp`.
- **Sanitización de errores `[FACT]`:** `solicitar<T>()` normaliza todas las respuestas: transforma cualquier `500` en `"Ocurrió un error interno en el servidor. Intente nuevamente más tarde."`; un `2xx` sin cuerpo JSON válido (`leerJson()` falla) en `"El servidor devolvió una respuesta inesperada. Intente nuevamente más tarde."`; y el filtro `ES_TECNICO` (`Unexpected token`, `<!doctype`, `not valid JSON`, `SyntaxError`) convierte esos casos en fallo de conexión. `mensajeErrorRed` traduce fallos de red (`Failed to fetch`) a `"No se pudo establecer conexión con el servidor backend."`. Ningún detalle interno (stack traces, statusText, SQL) llega al usuario.

### 3.2 Sintetizador Acústico (`src/utils/audioSynth.ts`)
- `reproducirTono(frecuenciaHz: number, duracionSegundos: number = 1.2): void`
- Controla el ciclo de vida del `AudioContext`, reanudando el contexto si se encuentra en estado suspendido por políticas de interacción del navegador.

### 3.3 Componentes Principales
1. **`NotaForm.tsx`:**
   - Controla campos de `titulo` (requerido, máx 200), `etiqueta` (opcional, máx 100) y `frecuenciaHz` (requerido, > 0 Hz).
   - Incluye botón de prueba acústica en tiempo real antes del guardado.
   - Muestra feedback de error inline (validación y fallos del servidor); el feedback de éxito **no se renderiza inline** sino que lo centraliza la alerta temporal global (`AutoDismissAlert`) del componente `App` para mantener un único tipo de notificación.
   - Comunica la creación al componente padre vía callback `onNotaRegistrada`.
2. **`NotaList.tsx`:**
    - Visualiza registros con títulos, etiquetas y lecturas de Hz en pantalla oscura digital.
    - **Paginación local en cliente:** 4 notas por página con controles retro "< ANTERIOR" / "SIGUIENTE >" y lectura "Página X de Y".
    - Incorpora botón para reproducir el tono de cada nota individualmente.
    - Botón "Editar" en cada tarjeta que abre `EditNotaModal`.
    - Eliminación mediante `ConfirmModal` retro (no usa `window.confirm` nativo).
    - Si la nota posee `fechaModificacion`, renderiza el texto "Editado: [fecha/hora]".
 3. **`ConfirmModal.tsx`:**
    - Modal retro estilizado (backdrop oscuro + panel con sombra mecánica) para confirmar la eliminación.
    - Recibe `abierto`, `tituloNota`, `confirmando`, `onConfirmar` y `onCancelar`. Renderiza `null` cuando está cerrado.
 4. **`EditNotaModal.tsx`:**
    - Modal retro que permite modificar Título, Etiqueta y Frecuencia Hz con preview acústico ("Probar").
    - Al guardar invoca `updateNota` (`PUT /api/notasaudio/{id}`) y notifica al padre con la entidad actualizada.
    - Se re-monta por nota (`key={nota.id}`) para inicializar sus campos sin efectos secundarios.
 5. **`AutoDismissAlert.tsx`:**
    - Alerta temporal que recibe `mensaje` y `tipo` (`success` | `error`).
    - Desvanece a los 3.5 s y se desmonta a los 4 s mediante `setTimeout`, con transición suave CSS.
 6. **`App.tsx`:**
    - Chasis unificado de la consola. Cabecera simplificada (sin subtítulo "Acoustic Calibration & Session Console", sin punto rojo decorativo, sin badge "OSC-01" ni badge "VITE + .NET 8").
    - Consulta inicial mediante `useEffect` al montar la aplicación.
    - Manejo reactivo de adición y edición de notas; notificaciones temporales (`AutoDismissAlert`) para crear/editar/eliminar.
    - Módulo superior de oscilador con display de frecuencia activa y botones de acceso rápido a frecuencias estándar (60 Hz, 440 Hz, 1 kHz, 5 kHz) con mayor espaciado.

---

## 4. Estrategia de Entornos y Despliegue

| Entorno | URL Base Backend Predeterminada | Método de Inyección |
| :--- | :--- | :--- |
| **Desarrollo Local (Vite)** | `http://localhost:8080` (fallback) | Variable `VITE_API_URL` en `.env` o fallback en código |
| **Contenedor Docker (Nginx)** | Configurable en build/run | `VITE_API_URL` en tiempo de compilación o reverse proxy |
| **Producción / Staging** | Dominio cloud | Inyección en pipeline de CI/CD |
