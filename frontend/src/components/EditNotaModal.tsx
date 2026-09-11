import { useState, type FormEvent } from 'react'
import type { NotaAudio, UpdateNotaAudioDto } from '../types/notaAudio'
import { updateNota, mensajeErrorRed } from '../services/api'
import { reproducirTono } from '../utils/audioSynth'

interface EditNotaModalProps {
  nota: NotaAudio | null
  onCerrar: () => void
  onNotaActualizada: (nota: NotaAudio) => void
}

export function EditNotaModal({ nota, onCerrar, onNotaActualizada }: EditNotaModalProps) {
  const [titulo, setTitulo] = useState(nota?.titulo ?? '')
  const [etiqueta, setEtiqueta] = useState(nota?.etiqueta ?? '')
  const [frecuenciaHz, setFrecuenciaHz] = useState(nota ? String(nota.frecuenciaHz) : '')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!nota) return null

  const handleProbarAudio = () => {
    const freq = parseFloat(frecuenciaHz)
    if (!isNaN(freq) && freq > 0) {
      reproducirTono(freq, 1.0)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!titulo.trim()) {
      setError('El título es obligatorio.')
      return
    }

    const freq = parseFloat(frecuenciaHz)
    if (isNaN(freq) || freq <= 0) {
      setError('La frecuencia debe ser un valor mayor a 0 Hz.')
      return
    }

    const payload: UpdateNotaAudioDto = {
      titulo: titulo.trim(),
      etiqueta: etiqueta.trim() || undefined,
      frecuenciaHz: freq,
    }

    try {
      setCargando(true)
      const actualizada = await updateNota(nota.id, payload)
      reproducirTono(freq, 0.6)
      onNotaActualizada(actualizada)
      onCerrar()
    } catch (err: unknown) {
      setError(mensajeErrorRed(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="synth-modal-backdrop" role="dialog" aria-modal="true" onClick={onCerrar}>
      <div className="synth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="synth-modal-header">
          <span className="synth-module-title">Editar Nota Acústica</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="edit-titulo"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}
            >
              Título de la Sesión / Prueba *
            </label>
            <input
              id="edit-titulo"
              type="text"
              className="synth-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={cargando}
              maxLength={200}
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-etiqueta"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}
            >
              Etiqueta (Opcional)
            </label>
            <input
              id="edit-etiqueta"
              type="text"
              className="synth-input"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              disabled={cargando}
              maxLength={100}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
              <label
                htmlFor="edit-frecuencia"
                style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}
              >
                Frecuencia Acústica (Hz) *
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--synth-text-muted)' }}>Mayor a 0 Hz</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="edit-frecuencia"
                type="number"
                step="any"
                min="0.01"
                className="synth-input synth-input-mono"
                value={frecuenciaHz}
                onChange={(e) => setFrecuenciaHz(e.target.value)}
                disabled={cargando}
                required
              />
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={handleProbarAudio}
                title="Escuchar tono sinusoidal antes de guardar"
                style={{ whiteSpace: 'nowrap' }}
              >
                Probar
              </button>
            </div>
          </div>

          {error && (
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
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="synth-btn synth-btn-secondary"
              onClick={onCerrar}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="synth-btn"
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
