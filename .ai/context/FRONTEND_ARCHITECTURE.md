# Arquitectura Propuesta para el Frontend React

> **ESTADO DE ESTE DOCUMENTO:** Todas las secciones aquí detalladas representan propuestas de diseño técnico catalogadas explícitamente como **`[DECISION]`**. Ninguna de estas decisiones es un hecho consumado ni debe considerarse definitiva hasta que el usuario las revise y apruebe explícitamente. No se debe escribir código de aplicación React hasta contar con dicha aprobación.

---

## 1. Stack Base y Herramientas de Construcción

- **`[DECISION]` Runtime y Bundler:** **Vite + React 18 / 19 + TypeScript**.
  - *Justificación:* Vite ofrece recarga en caliente instantánea (HMR), configuración cero de TypeScript y compatibilidad óptima para aplicaciones SPA desacopladas en monorepos. Se ubicará en el directorio `/frontend` como establece `CONTEXT.md`.
- **`[DECISION]` Integración con Web Audio API:**
  - El cliente debe incorporar un generador de tonos y oscilador nativo (`AudioContext`, `OscillatorNode`, `GainNode`) que interprete los valores de `frecuenciaHz` recibidos de la API. Se diseñará un reproductor con controles de inicio, parada, volumen, forma de onda (sinusoidal, cuadrada, triangular, sierra) y feedback visual de la onda acústica.

---

## 2. Estructura de Carpetas Propuesta

- **`[DECISION]` Organización Modular Basada en Características (Feature-Driven Architecture):**
  Se propone estructurar `/frontend` separando la lógica de negocio por módulos funcionales (`features/`):

  ```text
  /frontend
  ├── public/                      # Assets estáticos, favicons
  ├── src/
  │   ├── assets/                  # Íconos SVG, tipografías, sonidos base
  │   ├── components/              # Componentes UI transversales y diseño atómico
  │   │   ├── common/              # Button, Input, Modal, Toast, Badge, Spinner
  │   │   └── layout/              # Header, Footer, Sidebar, PageContainer
  │   ├── features/                # Módulos encapsulados por dominio
  │   │   ├── notasaudio/          # Dominio: Bitácora y Notas de Audio
  │   │   │   ├── api/             # Hooks de consulta y mutaciones HTTP
  │   │   │   │   ├── useNotasAudio.ts        # GET /api/notasaudio
  │   │   │   │   ├── useCreateNotaAudio.ts   # POST /api/notasaudio
  │   │   │   │   └── useDeleteNotaAudio.ts   # DELETE /api/notasaudio/{id}
  │   │   │   ├── components/      # UI del dominio
  │   │   │   │   ├── NotaAudioCard.tsx       # Tarjeta de nota con acción de play/delete
  │   │   │   │   ├── NotaAudioForm.tsx       # Formulario con validaciones en cliente
  │   │   │   │   ├── NotaAudioList.tsx       # Grilla/lista cronológica
  │   │   │   │   └── NotaAudioSearch.tsx     # Barra de filtrado local en memoria
  │   │   │   └── types/           # Tipos de dominio local
  │   │   └── audio-engine/        # Dominio: Motor de Síntesis Web Audio API
  │   │       ├── hooks/
  │   │       │   └── useToneGenerator.ts     # Hook reactivo para disparar frecuencias
  │   │       ├── services/
  │   │       │   └── WebAudioManager.ts      # Singleton para AudioContext / GainNode
  │   │       └── components/
  │   │           ├── AudioVisualizer.tsx     # Canvas con osciloscopio o visualizador de onda
  │   │           └── FrequencyDial.tsx       # Selector visual interactivo de Hz
  │   ├── lib/                     # Clientes de terceros y utilitarios
  │   │   ├── apiClient.ts         # Wrapper de Fetch o Axios con manejo de errores
  │   │   └── queryClient.ts       # Instancia configurada de TanStack Query
  │   ├── types/                   # Tipos globales generados y contratos
  │   │   ├── api.generated.ts     # Generado automáticamente desde Swagger OpenAPI
  │   │   └── index.ts             # Re-export de tipos
  │   ├── App.tsx                  # Componente raíz y orquestación de vistas
  │   ├── main.tsx                 # Punto de entrada de React con Providers
  │   └── index.css                # Sistema de diseño, tokens CSS y tema dark
  ├── .env.development            # VITE_API_BASE_URL=http://localhost:8080
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
  ```

---

## 3. Manejo de Estado y Data-Fetching

- **`[DECISION]` Librería de Data-Fetching Recomendada:** **TanStack Query (React Query v5)** combinado con un wrapper liviano sobre `fetch` nativo.
  - *Justificación en función del backend existente:*
    1. **Naturaleza del Backend:** El backend es una API REST estándar con operaciones CRUD. No implementa WebSockets, GraphQL ni streaming.
    2. **Caché e Invalidación Reactiva:** Tras invocar la mutación `POST /api/notasaudio` o `DELETE /api/notasaudio/{id}`, TanStack Query permite invalidar automáticamente la clave de consulta `['notasaudio']`, forzando una actualización transparente del listado sin recargar la página.
    3. **Ausencia de Refresh Tokens:** Al no existir mecanismos complejos de refresh de tokens o interceptores de autenticación circular en el backend, no se justifica el peso de una arquitectura de Redux Toolkit con RTK Query.
    4. **Manejo de Estados de Red:** Provee de forma declarativa `isLoading`, `isError`, `data` y reintentos en caso de indisponibilidad temporal.

- **`[DECISION]` Manejo de Estado Local de UI y Audio:**
  - Para el estado de la reproducción sonora (nota actualmente reproduciéndose, frecuencia activa en tiempo real, volumen maestro, estado de reproducción play/pause), se propone un store simple con **Zustand** o un **React Context con Custom Hook (`useAudioEngine`)**. Esto evita acoplar el estado de reproducción de audio con el estado de red de la API.

---

## 4. Manejo de Sesión y Autenticación en el Cliente

- **`[DECISION]` Estrategia Inicial Sin Autenticación (Modo Abierto):**
  - Dado que la auditoría del backend confirmó con evidencia (`[FACT]`) que **no existe autenticación ni autorización en la API**, el frontend operará inicialmente sin pantallas de login, registro ni guardias de ruta (`ProtectedRoute`).
- **`[DECISION]` Abstracción Preparada para Autenticación Futura:**
  - Se configurará el cliente HTTP (`apiClient.ts`) con una función extractora de tokens opcional:
    ```typescript
    // Inyección condicional y no bloqueante
    const token = getAuthToken(); // Retorna null inicialmente
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    ```
  - De este modo, si en una fase posterior el backend incorpora JWT o OAuth2, solo será necesario implementar la pantalla de login y guardar el token en el proveedor, sin tocar ninguna de las llamadas a los endpoints existentes.

---

## 5. Estrategia de Tipado TypeScript y OpenAPI

- **`[DECISION]` Tipado Automático a través de OpenAPI:**
  - Dado que el backend expone la especificación OpenAPI en `/swagger/v1/swagger.json` en todos los entornos (`[FACT]`), se propone utilizar la herramienta **`openapi-typescript`**.
  - *Comando propuesto en `package.json`:*
    ```json
    "scripts": {
      "types:generate": "openapi-typescript http://localhost:8080/swagger/v1/swagger.json -o src/types/api.generated.ts"
    }
    ```
- **`[DECISION]` Tipado Estático Fallback:**
  - Para permitir el desarrollo frontend sin requerir que la base de datos PostgreSQL y la API .NET estén activas simultáneamente en la máquina del desarrollador, se mantendrán sincronizados los tipos declarados en [.ai/context/API_CONTRACT.md](file:///c:/Users/Usuario/Desktop/Ejercicio_AR/.ai/context/API_CONTRACT.md) dentro de `src/types/index.ts`.

---

## 6. Diseño Visual y Estilos

- **`[DECISION]` Estética de Laboratorio Acústico / Dark Mode:**
  - Se propone una interfaz moderna con tema oscuro profundo (`#0f172a`, `#1e293b`), tipografía contemporánea (ej. `Inter` o `JetBrains Mono` para frecuencias), acentos en colores vibrantes (verde/cian/azul eléctrico para frecuencias activas) y un componente interactivo de visualización de ondas.
- **`[DECISION]` Solución de Estilos:**
  - Se propone el uso de **Vanilla CSS con variables/design tokens** o **TailwindCSS** (según preferencia del usuario), evitando librerías de componentes pesadas y genéricas que comprometan el rendimiento visual o limiten la personalización.
