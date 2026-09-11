/**
 * Servicio cliente para consumir los endpoints de la API .NET.
 * Basado en las especificaciones de .ai/context/API_CONTRACT.md.
 */

import type { NotaAudio, CreateNotaAudioDto, HealthStatus } from '../types/notaAudio'

// URL base del backend configurada por variable de entorno con fallback al puerto de Docker
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Función auxiliar para procesar errores devueltos por la API (ProblemDetails o { mensaje: string }).
 */
async function procesarError(response: Response): Promise<string> {
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
    // Si la respuesta no es JSON (ej. 500 o error de conexión)
    return `Error HTTP ${response.status}: ${response.statusText}`
  }
}

/**
 * Obtiene el listado completo de notas de audio registradas.
 * GET /api/notasaudio
 */
export async function getNotas(): Promise<NotaAudio[]> {
  const response = await fetch(`${BASE_URL}/api/notasaudio`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const detalle = await procesarError(response)
    throw new Error(detalle)
  }

  return response.json()
}

/**
 * Registra una nueva nota de audio en el sistema.
 * POST /api/notasaudio
 */
export async function createNota(dto: CreateNotaAudioDto): Promise<NotaAudio> {
  const response = await fetch(`${BASE_URL}/api/notasaudio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    const detalle = await procesarError(response)
    throw new Error(detalle)
  }

  return response.json()
}

/**
 * Elimina una nota de audio existente por su ID.
 * DELETE /api/notasaudio/{id}
 */
export async function deleteNota(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/notasaudio/${id}`, {
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
  const response = await fetch(`${BASE_URL}/health`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const detalle = await procesarError(response)
    throw new Error(detalle)
  }

  return response.json()
}
