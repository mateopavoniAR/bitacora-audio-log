# Contrato de API para Frontend React

> **Única Fuente de Verdad para Integración Frontend-Backend**  
> Este documento define con precisión quirúrgica el contrato de comunicación HTTP, las estructuras de datos (payloads), los códigos de estado, las reglas de validación y los formatos de error expuestos por la API .NET. El equipo de frontend no necesita inspeccionar el código C# del backend para implementar la aplicación.

---

## 1. Configuración de Entornos y URL Base

| Entorno | Estado | URL Base Backend | Swagger / OpenAPI |
| :--- | :--- | :--- | :--- |
| **Local (Docker)** | `[FACT]` | `http://localhost:8080` | `http://localhost:8080/swagger` |
| **Local (Kestrel directo)** | `[ASSUMPTION]` | `http://localhost:5000` (o `https://localhost:5001`) | `http://localhost:5000/swagger` |
| **Homologación (QA)** | `[UNKNOWN]` | Pendiente de asignación de dominio cloud | `{BASE_URL}/swagger` |
| **Producción** | `[UNKNOWN]` | Pendiente de asignación de dominio cloud | `{BASE_URL}/swagger` |

- **Especificación OpenAPI JSON:** `{BASE_URL}/swagger/v1/swagger.json` (habilitada en todos los entornos).
- **CORS:** El backend aplica la política `"AllowAll"`. Permite cualquier origen (incluyendo `http://localhost:5173` de Vite), cualquier método HTTP y cualquier encabezado.

---

## 2. Flujo de Autenticación y Autorización

### 2.1 Estado Actual en el Backend `[FACT]`
- **No existe autenticación ni autorización.**
- Ningún endpoint requiere encabezado `Authorization`, tokens Bearer, cookies de sesión ni credenciales.
- No existen endpoints de `/api/auth/login`, `/api/auth/refresh`, `/register` ni roles de usuario.

### 2.2 Directiva para el Cliente Frontend
1. **Peticiones Actuales:** El cliente React debe realizar las peticiones HTTP directamente sin enviar encabezados de autorización.
2. **Preparación Futura:** Se recomienda configurar el cliente HTTP (Fetch/Axios) con un interceptor que inyecte `Authorization: Bearer <token>` de forma opcional si dicho token llegara a existir en el almacenamiento local o en memoria, permitiendo que la incorporación de autenticación futura no requiera refactorizar las llamadas a la API.

---

## 3. Formato Unificado de Manejo de Errores

El backend presenta **dos formatos de error posibles**. El cliente frontend debe implementar un parser de errores que soporte ambas estructuras:

### Caso A: Errores de Validación (`400 Bad Request` vía ModelState)
Generado cuando los campos no cumplen las reglas de `DataAnnotations`:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Titulo": [
      "El título es obligatorio."
    ],
    "FrecuenciaHz": [
      "La frecuencia debe ser un valor positivo en Hertz (mayor a 0)."
    ]
  }
}
```

### Caso B: Errores de Negocio / Controlador (`404 Not Found` y `400 Bad Request` manuales)
Generado directamente en el controlador cuando un ID no existe o se rechaza un valor:
```json
{
  "mensaje": "No se encontró la nota de audio con Id 42."
}
```

### Caso C: Error Interno del Servidor (`500 Internal Server Error`)
Generado ante excepciones no controladas de la base de datos o runtime:
- Código de estado: `500`.
- El frontend debe capturarlo como fallback genérico: *"Ocurrió un error interno en el servidor. Intente nuevamente más tarde."*

---

## 4. Parámetros de Consulta, Filtros y Paginación

- **Paginación `[FACT]`:** **NO soportada**. El backend no acepta parámetros como `page`, `pageSize`, `limit`, o `offset`.
- **Filtros `[FACT]`:** **NO soportados**. No existen query params como `?etiqueta=...`, `?search=...`, ni filtros por rango de fechas o frecuencias.
- **Ordenamiento `[FACT]`:** El listado se entrega siempre pre-ordenado de forma descendente por `fechaCreacion` (`OrderByDescending(n => n.FechaCreacion)`).
- **Recomendación para el Frontend:** Si se requiere filtrar por etiqueta o buscar por título en la versión inicial, dicho filtrado deberá realizarse **en memoria en el cliente React** sobre el conjunto devuelto por `GET /api/notasaudio`.

---

## 5. Catálogo Completo de Endpoints

### 5.1 Health Check
Verifica la disponibilidad básica del servicio.

- **Método:** `GET`
- **Ruta:** `/health`
- **Autenticación:** No requerida
- **Parámetros:** Ninguno
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "status": "Healthy",
    "timestamp": "2026-09-11T11:45:00.1234567Z"
  }
  ```

---

### 5.2 Redirección a Documentación
Redirecciona la raíz hacia la interfaz Swagger UI.

- **Método:** `GET`
- **Ruta:** `/`
- **Respuesta:** `302 Found` con encabezado `Location: /swagger`

---

### 5.3 Obtener Todas las Notas de Audio
Retorna la colección completa de notas de audio registradas, ordenadas de la más reciente a la más antigua.

- **Método:** `GET`
- **Ruta:** `/api/notasaudio`
- **Headers:** `Accept: application/json`
- **Query Params:** Ninguno soportado
- **Autenticación:** No requerida
- **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Tono de Calibración Estándar A4",
      "etiqueta": "Calibración",
      "frecuenciaHz": 440.0,
      "fechaCreacion": "2026-09-11T10:15:30Z"
    },
    {
      "id": 2,
      "titulo": "Sub-bajo de prueba acústica",
      "etiqueta": "Bajos",
      "frecuenciaHz": 60.0,
      "fechaCreacion": "2026-09-11T09:00:00Z"
    }
  ]
  ```
  *(Si no hay registros en la base de datos, retorna un array vacío `[]` con status `200 OK`)*.

---

### 5.4 Obtener Nota de Audio por ID
Consulta el detalle de una nota específica por su identificador numérico.

- **Método:** `GET`
- **Ruta:** `/api/notasaudio/{id}`
- **Parámetros de Ruta:**
  - `id` (`integer`, requerido): Identificador entero positivo de la nota.
- **Autenticación:** No requerida
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 1,
    "titulo": "Tono de Calibración Estándar A4",
    "etiqueta": "Calibración",
    "frecuenciaHz": 440.0,
    "fechaCreacion": "2026-09-11T10:15:30Z"
  }
  ```
- **Respuesta de Recurso No Encontrado (`404 Not Found`):**
  ```json
  {
    "mensaje": "No se encontró la nota de audio con Id 99."
  }
  ```

---

### 5.5 Crear una Nueva Nota de Audio
Registra una nueva nota de audio y su frecuencia de prueba.

- **Método:** `POST`
- **Ruta:** `/api/notasaudio`
- **Headers Requeridos:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Autenticación:** No requerida
- **Cuerpo de la Petición (`CreateNotaAudioDto`):**
  ```json
  {
    "titulo": "Tono de Prueba 1 kHz",
    "etiqueta": "Referencia",
    "frecuenciaHz": 1000.0,
    "fechaCreacion": "2026-09-11T12:00:00Z"
  }
  ```
- **Reglas de Validación de los Campos:**
  | Campo | Tipo | Obligatorio | Restricciones / Reglas | Valor por Defecto si se omite |
  | :--- | :--- | :--- | :--- | :--- |
  | `titulo` | `string` | **Sí** | Máximo 200 caracteres. No puede ser vacío ni consistir solo de espacios en blanco. | N/A (falla validación) |
  | `etiqueta` | `string` | No | Máximo 100 caracteres. | `""` (string vacío) |
  | `frecuenciaHz` | `number` (double) | **Sí** | Valor mayor a 0. Rango válido: `0.01` a `200000.0`. | N/A (falla validación) |
  | `fechaCreacion`| `string` (ISO 8601)| No | Fecha y hora en formato UTC válido. | `DateTime.UtcNow` del servidor |

- **Respuesta Exitosa (`201 Created`):**
  - **Encabezado `Location`:** `/api/notasaudio/{nuevoId}`
  - **Cuerpo:** Objeto `NotaAudio` creado con su ID generado:
    ```json
    {
      "id": 3,
      "titulo": "Tono de Prueba 1 kHz",
      "etiqueta": "Referencia",
      "frecuenciaHz": 1000.0,
      "fechaCreacion": "2026-09-11T12:00:00Z"
    }
    ```
- **Respuestas de Error (`400 Bad Request`):**
  - *Por validación de DataAnnotations:*
    ```json
    {
      "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
      "title": "One or more validation errors occurred.",
      "status": 400,
      "errors": {
        "Titulo": ["El título es obligatorio."],
        "FrecuenciaHz": ["La frecuencia debe ser un valor positivo en Hertz (mayor a 0)."]
      }
    }
    ```
  - *Por validación explícita de título vacío:*
    ```json
    {
      "mensaje": "El título de la nota no puede estar vacío."
    }
    ```
  - *Por validación explícita de frecuencia menor o igual a cero:*
    ```json
    {
      "mensaje": "La frecuencia en Hertz debe ser un valor mayor a 0."
    }
    ```

---

### 5.6 Eliminar una Nota de Audio
Elimina físicamente un registro de nota de audio existente a partir de su ID.

- **Método:** `DELETE`
- **Ruta:** `/api/notasaudio/{id}`
- **Parámetros de Ruta:**
  - `id` (`integer`, requerido): Identificador entero de la nota a eliminar.
- **Autenticación:** No requerida
- **Respuesta Exitosa (`204 No Content`):**
  - Sin cuerpo en la respuesta (`Content-Length: 0`).
- **Respuesta de Recurso No Encontrado (`404 Not Found`):**
  ```json
  {
    "mensaje": "No se encontró la nota de audio con Id 99 para eliminar."
  }
  ```

---

## 6. Tipos TypeScript Derivados del Contrato

Estos tipos representan el esquema exacto de intercambio de datos:

```typescript
// Entidad devuelta por GET y POST
export interface NotaAudio {
  id: number;
  titulo: string;
  etiqueta: string;
  frecuenciaHz: number;
  fechaCreacion: string; // ISO 8601 string (ej: "2026-09-11T12:00:00Z")
}

// Payload de entrada para POST /api/notasaudio
export interface CreateNotaAudioDto {
  titulo: string;
  etiqueta?: string;
  frecuenciaHz: number;
  fechaCreacion?: string; // Opcional, ISO 8601
}

// Respuesta de error estándar RFC 7807/9110 (ValidationProblemDetails)
export interface ValidationProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Respuesta de error de negocio / controlador
export interface ApiErrorMessage {
  mensaje: string;
}

// Estado del Healthcheck
export interface HealthStatus {
  status: "Healthy" | "Unhealthy" | string;
  timestamp: string;
}
```
