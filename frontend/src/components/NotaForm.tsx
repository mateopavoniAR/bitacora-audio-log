import { useState, type FormEvent } from 'react'
import type { NotaAudio, CreateNotaAudioDto } from '../types/notaAudio'
import { createNota } from '../services/api'
import { reproducirTono } from '../utils/audioSynth'

interface NotaFormProps {
  /** Función opcional que se ejecuta cuando una nota es guardada con éxito */
  onNotaRegistrada?: (nuevaNota: NotaAudio) => void
}

/**
 * Formulario retro estilo módulo analógico para el registro de notas de audio y frecuencias.
 */
export function NotaForm({ onNotaRegistrada }: NotaFormProps) {
  // Estados para controlar los campos del formulario
  const [titulo, setTitulo] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [frecuenciaHz, setFrecuenciaHz] = useState<string>('440')

  // Estados para feedback al usuario
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Escuchar el tono de la frecuencia ingresada antes de guardar
  const handleProbarAudio = () => {
    const frecuenciaNum = parseFloat(frecuenciaHz)
    if (isNaN(frecuenciaNum) || frecuenciaNum <= 0) {
      setMensajeError('Ingresá una frecuencia válida mayor a 0 Hz para probarla.')
      return
    }
    setMensajeError(null)
    reproducirTono(frecuenciaNum, 1.2)
  }

  // Manejo del envío del formulario hacia la API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)

    // 1. Validación en cliente: Título requerido
    if (!titulo.trim()) {
      setMensajeError('El título es obligatorio.')
      return
    }

    // 2. Validación en cliente: Frecuencia numérica positiva
    const frecuenciaNum = parseFloat(frecuenciaHz)
    if (isNaN(frecuenciaNum) || frecuenciaNum <= 0) {
      setMensajeError('La frecuencia en Hertz debe ser un valor mayor a 0.')
      return
    }

    const payload: CreateNotaAudioDto = {
      titulo: titulo.trim(),
      etiqueta: etiqueta.trim() || undefined,
      frecuenciaHz: frecuenciaNum,
    }

    try {
      setCargando(true)
      const notaCreada = await createNota(payload)
      
      // Feedback y limpieza del formulario
      setMensajeExito(`¡Nota "${notaCreada.titulo}" registrada con éxito!`)
      setTitulo('')
      setEtiqueta('')
      setFrecuenciaHz('440')

      // Reproducimos brevemente la frecuencia guardada a modo de confirmación acústica
      reproducirTono(frecuenciaNum, 0.8)

      // Notificar al componente padre si definió el callback
      if (onNotaRegistrada) {
        onNotaRegistrada(notaCreada)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensajeError(err.message)
      } else {
        setMensajeError('Ocurrió un error inesperado al guardar la nota.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="synth-panel-accent" style={{ maxWidth: '480px', width: '100%' }}>
      {/* Encabezado del Módulo */}
      <div className="synth-module-header">
        <span className="synth-module-title">Registro de Nota Acústica</span>
        <span className="synth-badge">ENTRADA</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Campo 1: Título */}
        <div>
          <label
            htmlFor="titulo-input"
            style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}
          >
            Título de la Sesión / Prueba *
          </label>
          <input
            id="titulo-input"
            type="text"
            className="synth-input"
            placeholder="Ej: Calibración Estudio Principal"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={cargando}
            maxLength={200}
            required
          />
        </div>

        {/* Campo 2: Etiqueta */}
        <div>
          <label
            htmlFor="etiqueta-input"
            style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}
          >
            Etiqueta (Opcional)
          </label>
          <input
            id="etiqueta-input"
            type="text"
            className="synth-input"
            placeholder="Ej: Calibración, Sub-graves, Agudos"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            disabled={cargando}
            maxLength={100}
          />
        </div>

        {/* Campo 3: Frecuencia en Hertz */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <label
              htmlFor="frecuencia-input"
              style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}
            >
              Frecuencia Acústica (Hz) *
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--synth-text-muted)' }}>Mayor a 0 Hz</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="frecuencia-input"
              type="number"
              step="any"
              min="0.01"
              className="synth-input synth-input-mono"
              placeholder="440"
              value={frecuenciaHz}
              onChange={(e) => setFrecuenciaHz(e.target.value)}
              disabled={cargando}
              required
            />
            {/* Botón rápido para escuchar la frecuencia antes de registrar */}
            <button
              type="button"
              className="synth-btn synth-btn-secondary"
              onClick={handleProbarAudio}
              title="Escuchar tono sinusoidal antes de registrar"
              style={{ whiteSpace: 'nowrap' }}
            >
              Probar
            </button>
          </div>
        </div>

        {/* Mensajes de Feedback */}
        {mensajeError && (
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#FFEBEE',
              border: '1px solid #D32F2F',
              color: '#B71C1C',
              fontSize: '0.825rem',
              borderRadius: '2px',
              fontWeight: 600,
            }}
          >
            {mensajeError}
          </div>
        )}

        {mensajeExito && (
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#E8F5E9',
              border: '1px solid #2E7D32',
              color: '#1B5E20',
              fontSize: '0.825rem',
              borderRadius: '2px',
              fontWeight: 600,
            }}
          >
            {mensajeExito}
          </div>
        )}

        {/* Botón Principal de Envío */}
        <button
          type="submit"
          className="synth-btn"
          disabled={cargando}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {cargando ? 'Guardando Registro...' : 'Registrar en Bitácora'}
        </button>
      </form>
    </section>
  )
}
