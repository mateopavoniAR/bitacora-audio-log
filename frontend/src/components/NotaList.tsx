import { useState } from 'react'
import type { NotaAudio } from '../types/notaAudio'
import { reproducirTono } from '../utils/audioSynth'

interface NotaListProps {
  /** Colección de notas de audio registradas */
  notas: NotaAudio[]
  /** Estado de carga mientras se consulta la API */
  cargando: boolean
  /** Callback para eliminar una nota por su identificador */
  onEliminarNota: (id: number) => Promise<void>
  /** Callback opcional para sincronizar la frecuencia activa en el oscilador principal */
  onSeleccionarNota?: (frecuenciaHz: number) => void
}

/**
 * Componente que renderiza el listado de notas acústicas con estética de rack analógico.
 */
export function NotaList({
  notas,
  cargando,
  onEliminarNota,
  onSeleccionarNota,
}: NotaListProps) {
  // Estado local para bloquear el botón de la fila que se está eliminando
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  // Formateador amigable de fechas ISO a formato legible
  const formatearFecha = (fechaIso: string): string => {
    try {
      const fecha = new Date(fechaIso)
      return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return fechaIso
    }
  }

  // Manejar eliminación con diálogo de confirmación nativo
  const handleEliminar = async (id: number, titulo: string) => {
    const confirmar = window.confirm(`¿Seguro que deseás eliminar la nota "${titulo}"?`)
    if (!confirmar) return

    try {
      setEliminandoId(id)
      await onEliminarNota(id)
    } finally {
      setEliminandoId(null)
    }
  }

  // Reproducir el tono sonoro y opcionalmente notificar al panel principal
  const handleEscuchar = (frecuenciaHz: number) => {
    reproducirTono(frecuenciaHz, 1.2)
    if (onSeleccionarNota) {
      onSeleccionarNota(frecuenciaHz)
    }
  }

  return (
    <section className="synth-panel" style={{ width: '100%' }}>
      {/* Encabezado del Módulo de Listado */}
      <div className="synth-module-header">
        <div>
          <span className="synth-module-title">Bitácora de Notas Registradas</span>
        </div>
        <div className="synth-hz-readout" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--synth-text-muted)' }}>
          {notas.length} {notas.length === 1 ? 'REGISTRO' : 'REGISTROS'}
        </div>
      </div>

      {/* Estado 1: Cargando datos desde la API */}
      {cargando && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--synth-text-muted)' }}>
          <p className="synth-hz-readout" style={{ fontSize: '1rem', fontWeight: 600 }}>
            Consultando registros en el servidor...
          </p>
        </div>
      )}

      {/* Estado 2: Lista Vacía (sin notas) */}
      {!cargando && notas.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            backgroundColor: '#FAF7F2',
            border: '1px dashed #D0C9BE',
            borderRadius: '2px',
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--synth-text-main)', marginBottom: '0.25rem' }}>
            No hay notas acústicas registradas aún.
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--synth-text-muted)' }}>
            Completá el formulario lateral para guardar tu primera frecuencia de prueba.
          </span>
        </div>
      )}

      {/* Estado 3: Renderizado de Filas de Notas */}
      {!cargando && notas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notas.map((nota) => {
            const estaEliminando = eliminandoId === nota.id

            return (
              <article
                key={nota.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #1C1917',
                  boxShadow: '2px 2px 0px #1C1917',
                  borderRadius: '2px',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Información Principal: Título, Fecha y Etiqueta */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                      {nota.titulo}
                    </h3>
                    {nota.etiqueta && (
                      <span className="synth-badge" title="Etiqueta de la sesión">
                        {nota.etiqueta}
                      </span>
                    )}
                  </div>
                  <time
                    className="synth-hz-readout"
                    style={{ fontSize: '0.75rem', color: 'var(--synth-text-muted)' }}
                  >
                    Registrado: {formatearFecha(nota.fechaCreacion)}
                  </time>
                </div>

                {/* Display Numérico de Frecuencia */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div
                    className="synth-display synth-hz-readout"
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.6rem',
                      fontSize: '1rem',
                      color: 'var(--synth-text-display)',
                    }}
                    title="Frecuencia en Hertz"
                  >
                    {nota.frecuenciaHz.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>Hz</span>
                  </div>
                </div>

                {/* Botones de Acción: Escuchar y Eliminar */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="synth-btn synth-btn-secondary"
                    onClick={() => handleEscuchar(nota.frecuenciaHz)}
                    title="Reproducir tono de prueba con Web Audio"
                  >
                    Escuchar
                  </button>

                  <button
                    type="button"
                    className="synth-btn"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#B71C1C',
                      borderColor: '#B71C1C',
                      boxShadow: '2px 2px 0px #B71C1C',
                      padding: '0.45rem 0.75rem',
                    }}
                    onClick={() => handleEliminar(nota.id, nota.titulo)}
                    disabled={estaEliminando}
                    title="Eliminar registro permanentemente"
                  >
                    {estaEliminando ? 'Borrando...' : 'Eliminar'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
