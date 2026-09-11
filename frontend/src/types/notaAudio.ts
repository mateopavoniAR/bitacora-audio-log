/**
 * Modelos de datos y DTOs para la entidad NotaAudio.
 * Basado estrictamente en las especificaciones de .ai/context/API_CONTRACT.md.
 */

/**
 * Entidad NotaAudio devuelta por los endpoints GET /api/notasaudio,
 * GET /api/notasaudio/{id} y POST /api/notasaudio.
 */
export interface NotaAudio {
  /** Identificador único autonumérico asignado por la base de datos */
  id: number;
  /** Título descriptivo de la nota o sesión acústica (máx 200 caracteres) */
  titulo: string;
  /** Etiqueta o categoría opcional de la sesión (máx 100 caracteres) */
  etiqueta: string;
  /** Frecuencia de prueba en Hertz (Hz > 0) */
  frecuenciaHz: number;
  /** Marca de tiempo de registro en formato ISO 8601 UTC */
  fechaCreacion: string;
  /** Marca de tiempo de última modificación en formato ISO 8601 UTC (solo si fue editada) */
  fechaModificacion?: string;
}

/**
 * Payload para la creación de una nueva nota de audio en POST /api/notasaudio.
 */
export interface CreateNotaAudioDto {
  /** Título obligatorio (no vacío, máx 200 caracteres) */
  titulo: string;
  /** Etiqueta opcional (máx 100 caracteres) */
  etiqueta?: string;
  /** Frecuencia obligatoria en Hertz (valor > 0, rango 0.01 a 200000.0) */
  frecuenciaHz: number;
  /** Fecha opcional en formato ISO 8601 UTC. Si se omite, el servidor asigna UTC actual */
  fechaCreacion?: string;
}

/**
 * Payload para la actualización de una nota existente en PUT /api/notasaudio/{id}.
 */
export interface UpdateNotaAudioDto {
  /** Título obligatorio (no vacío, máx 200 caracteres) */
  titulo: string;
  /** Etiqueta opcional (máx 100 caracteres) */
  etiqueta?: string;
  /** Frecuencia obligatoria en Hertz (valor > 0, rango 0.01 a 200000.0) */
  frecuenciaHz: number;
}

/**
 * Estructura estándar RFC 7807/9110 para errores de validación de modelo (400 Bad Request).
 */
export interface ValidationProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

/**
 * Formato de error personalizado emitido por controladores (404 Not Found o 400 manual).
 */
export interface ApiErrorMessage {
  mensaje: string;
}

/**
 * Respuesta del endpoint de healthcheck GET /health.
 */
export interface HealthStatus {
  status: 'Healthy' | 'Unhealthy' | string;
  timestamp: string;
}
