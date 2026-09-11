# Convenciones de Desarrollo y Comunicación

Este documento define las reglas de codificación, nombrado, comunicación y control de versiones que deben cumplirse de manera uniforme en todo el repositorio (tanto en el backend .NET como en el futuro frontend React).

---

## 1. Convenciones de Comunicación HTTP y Serialización JSON

1. **Casing en JSON (Capa de Red):**
   - **`camelCase` Estricto:** Toda propiedad enviada o recibida en payloads JSON debe utilizar `camelCase`.
   - Propiedades del dominio: `id`, `titulo`, `etiqueta`, `frecuenciaHz`, `fechaCreacion`.
   - Propiedades de respuestas de error: `mensaje`, `type`, `title`, `status`, `errors`.
   - **Prohibido:** No enviar propiedades en `PascalCase` ni `snake_case` en los cuerpos de las peticiones JSON.

2. **Formato de Fechas y Tiempo:**
   - Todas las fechas se serializan y parsean como cadenas de texto en formato **ISO 8601 en tiempo universal coordinado (UTC)**:
     `YYYY-MM-DDTHH:mm:ss.sssZ` (ejemplo: `2026-09-11T12:00:00Z`).
   - El cliente debe convertir la fecha UTC a la zona horaria local del navegador únicamente en la capa visual de presentación.

3. **Verbos y Semántica HTTP:**
   - `GET`: Recuperación idempotente de recursos. No debe provocar efectos secundarios.
   - `POST`: Creación de un nuevo recurso. Requiere cabecera `Content-Type: application/json`. Retorna `201 Created` con encabezado `Location` y el objeto creado.
   - `DELETE`: Eliminación idempotente de un recurso. Retorna `204 No Content` si la eliminación fue exitosa, o `404 Not Found` si el recurso no existía.

4. **Códigos de Estado HTTP Utilizados:**
   - `200 OK`: Consulta exitosa (`GET`).
   - `201 Created`: Creación exitosa (`POST`).
   - `204 No Content`: Eliminación exitosa sin cuerpo (`DELETE`).
   - `400 Bad Request`: Error de validación de datos o regla de negocio violada en cliente.
   - `404 Not Found`: El identificador solicitado no existe en la base de datos.
   - `500 Internal Server Error`: Falla no capturada en el servidor.

---

## 2. Convenciones de Código Backend (.NET 8 / C#)

1. **Nombrado C#:**
   - Clases, Records, Structs, Enums e Interfaces: `PascalCase` (ej: `NotasAudioController`, `NotaAudio`, `AppDbContext`).
   - Propiedades y Métodos públicos: `PascalCase` (ej: `FrecuenciaHz`, `GetAll()`, `Create()`).
   - Parámetros de métodos y variables locales: `camelCase` (ej: `frecuenciaHz`, `nuevaNota`).
   - Campos privados: prefijo guión bajo y `camelCase` (ej: `_context`, `_logger`).
2. **Nullable Reference Types:**
   - Habilitado de forma obligatoria en el `.csproj` (`<Nullable>enable</Nullable>`). Ninguna variable de referencia debe ser potencialmente nula sin declararse con `?`.
3. **Manejo Asíncrono:**
   - Toda operación de I/O contra la base de datos de Entity Framework Core debe ser asíncrona (`await _context.NotasAudio.ToListAsync()`, `await _context.SaveChangesAsync()`).
   - Las consultas de solo lectura en `GET` deben usar `.AsNoTracking()` para maximizar el rendimiento.

---

## 3. Convenciones de Código Frontend (React / TypeScript)

1. **Nombrado TypeScript:**
   - Interfaces y Types: `PascalCase` (ej: `NotaAudio`, `CreateNotaAudioDto`).
   - Componentes React: `PascalCase` y coincidente con el nombre de archivo (ej: `NotaAudioCard.tsx`, `AudioVisualizer.tsx`).
   - Custom Hooks: prefijo `use` en `camelCase` (ej: `useNotasAudio`, `useToneGenerator`).
   - Funciones auxiliares, variables y propiedades: `camelCase` (ej: `handlePlay`, `formatFrequency`).
   - Constantes globales: `UPPER_SNAKE_CASE` (ej: `DEFAULT_FREQUENCY_HZ`, `MAX_AUDIO_GAIN`).
2. **Archivos y Estructura:**
   - Un componente por archivo, exportado por defecto o nominal según el estándar del equipo.
   - Co-locación de estilos y pruebas junto a la feature (`features/notasaudio/components/NotaAudioCard.tsx`).
3. **Tipado Estricto:**
   - Prohibido el uso de `any`. Toda respuesta de API debe tiparse con interfaces que cumplan con el `API_CONTRACT.md`.

---

## 4. Convenciones de Git y Control de Versiones

1. **Mensajes de Commit (Conventional Commits):**
   Siguiendo el historial verificado del repositorio:
   - `feat(...)`: Nueva funcionalidad de usuario o sistema (ej: `feat(frontend): inicializar app con Vite y soporte Web Audio`).
   - `fix(...)`: Corrección de un defecto (ej: `fix(backend): corregir validacion de frecuencia maxima`).
   - `test(...)`: Incorporación o ajuste de pruebas unitarias o de integración.
   - `chore(...)`: Tareas de mantenimiento, dependencias o configuración Docker.
   - `docs(...)`: Modificaciones exclusivas de documentación.
2. **Estrategia de Ramas:**
   - Rama base de trabajo local: `desarrollo`.
   - Rama de homologación / staging: `homologacion`.
   - Rama de producción: `produccion`.
