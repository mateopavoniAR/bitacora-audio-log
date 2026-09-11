/**
 * Módulo de síntesis de audio mediante la Web Audio API nativa del navegador.
 * Emite tonos sinusoidales puros de prueba acústica según la frecuencia en Hertz.
 */

// Instancia compartida de AudioContext para reutilizar recursos del navegador
let audioContext: AudioContext | null = null

/**
 * Obtiene o inicializa el contexto de audio del navegador de forma segura.
 * Soporta navegadores estándar y WebKit clásico.
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioContext = new AudioContextClass()
  }

  // Si el navegador suspendió el audio por falta de interacción del usuario, lo reanudamos
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

/**
 * Emite un tono sinusoidal puro a la frecuencia especificada.
 * 
 * @param frecuenciaHz Frecuencia en Hertz a reproducir (ej: 440 Hz para A4).
 * @param duracionSegundos Duración del tono en segundos (por defecto 1.2s).
 */
export function reproducirTono(frecuenciaHz: number, duracionSegundos: number = 1.2): void {
  // Validación de seguridad para la frecuencia
  if (frecuenciaHz <= 0) {
    console.warn('La frecuencia debe ser mayor a 0 Hz para reproducirse.')
    return
  }

  try {
    const ctx = getAudioContext()
    const tiempoInicio = ctx.currentTime
    const tiempoFin = tiempoInicio + duracionSegundos

    // 1. Crear oscilador de onda senoidal pura (tono clásico de calibración)
    const oscilador = ctx.createOscillator()
    oscilador.type = 'sine'
    oscilador.frequency.setValueAtTime(frecuenciaHz, tiempoInicio)

    // 2. Crear nodo de ganancia (volumen) con envolvente suave para evitar chasquidos (clics)
    const nodoGanancia = ctx.createGain()
    
    // Inicio silencioso, ataque rápido a volumen moderado (0.2) y decaimiento suave
    nodoGanancia.gain.setValueAtTime(0, tiempoInicio)
    nodoGanancia.gain.linearRampToValueAtTime(0.2, tiempoInicio + 0.05)
    nodoGanancia.gain.exponentialRampToValueAtTime(0.0001, tiempoFin)

    // 3. Conectar los nodos: Oscilador -> Volumen -> Altavoces del sistema
    oscilador.connect(nodoGanancia)
    nodoGanancia.connect(ctx.destination)

    // 4. Iniciar y programar la parada automática del tono
    oscilador.start(tiempoInicio)
    oscilador.stop(tiempoFin)
  } catch (error) {
    console.error('Error al intentar reproducir el tono acústico:', error)
  }
}
