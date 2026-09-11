/**
 * Servicio cliente para consumir los endpoints de la API .NET.
 * Basado en las especificaciones de .ai/context/API_CONTRACT.md.
 */

import type { NotaAudio, CreateNotaAudioDto, UpdateNotaAudioDto, HealthStatus } from '../types/notaAudio'

// URL base del backend configurada por variable de entorno con fallback al puerto de desarrollo local
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const RESPUESTA_INESPERADA = 'El servidor devolvió una respuesta inesperada. Intente nuevamente más tarde.'
const MENSAJE_CONEXION = 'No se pudo establecer conexión con el servidor backend.'
const ES_TECNICO = /Unexpected token|<!doctype|not valid JSON|SyntaxError/i

/**
 * Función auxiliar para procesar errores devueltos por la API (ProblemDetails o { mensaje: string }).
 * Los errores 500 y los fallos de red se transforman en mensajes genéricos no sensibles.
 */
async function procesarError(response: Response): Promise<string> {
  if (response.status === 500) {
    return 'Ocurrió un error interno en el servidor. Intente nuevamente más tarde.'
  }

  try {
    const errorData = await response.json()
    // Caso 1: Error con propiedad personalizada 'mensaje'
    if (errorData.mensaje) {
      return errorData.mensaje
    }
    // Caso 2: Error de validación RFC 7807/9110 con lista de errores
    if (errorData.errors) {
      const mensajes = Object.values(errorData.errors).flat()
      return mensajes.join(' ')
    }
    return 'Error en la petición al servidor.'
  } catch {
    // Si la respuesta no es JSON (ej. HTML, error de conexión o respuesta vacía)
    return `Error en la petición al servidor (código ${response.status}).`
  }
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function solicitar<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)

  if (!response.ok) {
    const detalle = await procesarError(response)
    throw new Error(detalle)
  }

  const datos = await leerJson(response)
  if (datos === null) {
    throw new Error(RESPUESTA_INESPERADA)
  }

  return datos as T
}

/**
 * Traduce cualquier error de red/lanzado a un mensaje legible y seguro para el usuario.
 */
export function mensajeErrorRed(err: unknown): string {
  if (
    err instanceof Error &&
    err.message &&
    err.message !== 'Failed to fetch' &&
    err.message !== 'fetch failed' &&
    !ES_TECNICO.test(err.message)
  ) {
    return err.message
  }
  return MENSAJE_CONEXION
}

/**
 * Obtiene el listado completo de notas de audio registradas.
 * GET /api/notasaudio
 */
export async function getNotas(): Promise<NotaAudio[]> {
  return solicitar<NotaAudio[]>(`${API_BASE_URL}/api/notasaudio`, {
    headers: {
      Accept: 'application/json',
    },
  })
}

/**
 * Registra una nueva nota de audio en el sistema.
 * POST /api/notasaudio
 */
export async function createNota(dto: CreateNotaAudioDto): Promise<NotaAudio> {
  return solicitar<NotaAudio>(`${API_BASE_URL}/api/notasaudio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(dto),
  })
}

/**
 * Actualiza el título, etiqueta y frecuencia de una nota existente.
 * PUT /api/notasaudio/{id}
 */
export async function updateNota(id: number, dto: UpdateNotaAudioDto): Promise<NotaAudio> {
  return solicitar<NotaAudio>(`${API_BASE_URL}/api/notasaudio/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(dto),
  })
}

/**
 * Elimina una nota de audio existente por su ID.
 * DELETE /api/notasaudio/{id}
 */
export async function deleteNota(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notasaudio/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const detalle = await procesarError(response)
    throw new Error(detalle)
  }
}

/**
 * Consulta el estado de salud del backend.
 * GET /health
 */
export async function getHealth(): Promise<HealthStatus> {
  return solicitar<HealthStatus>(`${API_BASE_URL}/health`, {
    headers: {
      Accept: 'application/json',
    },
  })
}