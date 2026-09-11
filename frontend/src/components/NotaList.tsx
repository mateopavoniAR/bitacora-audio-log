import { useState, useMemo } from 'react'
import type { NotaAudio } from '../types/notaAudio'
import { reproducirTono } from '../utils/audioSynth'
import { ConfirmModal } from './ConfirmModal'
import { EditNotaModal } from './EditNotaModal'

const NOTAS_POR_PAGINA = 4

interface NotaListProps {
  notas: NotaAudio[]
  cargando: boolean
  onEliminarNota: (id: number) => Promise<void>
  onSeleccionarNota?: (frecuenciaHz: number) => void
  onNotaActualizada: (nota: NotaAudio) => void
}

export function NotaList({
  notas,
  cargando,
  onEliminarNota,
  onSeleccionarNota,
  onNotaActualizada,
}: NotaListProps) {
  const [paginaActual, setPaginaActual] = useState(1)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)
  const [notaAEliminar, setNotaAEliminar] = useState<NotaAudio | null>(null)
  const [notaAEditar, setNotaAEditar] = useState<NotaAudio | null>(null)

  const totalPaginas = Math.max(1, Math.ceil(notas.length / NOTAS_POR_PAGINA))
  const paginaEfectiva = Math.min(paginaActual, totalPaginas)
  const notasPagina = useMemo(() => {
    const inicio = (paginaEfectiva - 1) * NOTAS_POR_PAGINA
    return notas.slice(inicio, inicio + NOTAS_POR_PAGINA)
  }, [notas, paginaEfectiva])

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

  const handleConfirmarEliminar = async () => {
    if (!notaAEliminar) return
    const id = notaAEliminar.id
    try {
      setEliminandoId(id)
      await onEliminarNota(id)
      setNotaAEliminar(null)
      setEliminandoId(null)
    } catch {
      setEliminandoId(null)
    }
  }

  const handleEscuchar = (frecuenciaHz: number) => {
    reproducirTono(frecuenciaHz, 1.2)
    if (onSeleccionarNota) onSeleccionarNota(frecuenciaHz)
  }

  return (
    <>
      <section className="synth-panel" style={{ width: '100%' }}>
        <div className="synth-module-header">
          <div>
            <span className="synth-module-title">Bitácora de Notas Registradas</span>
          </div>
          <div className="synth-hz-readout" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--synth-text-muted)' }}>
            {notas.length} {notas.length === 1 ? 'REGISTRO' : 'REGISTROS'}
          </div>
        </div>

        {cargando && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--synth-text-muted)' }}>
            <p className="synth-hz-readout" style={{ fontSize: '1rem', fontWeight: 600 }}>
              Consultando registros en el servidor...
            </p>
          </div>
        )}

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

        {!cargando && notas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notasPagina.map((nota) => {
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
                    {nota.fechaModificacion && (
                      <div
                        className="synth-hz-readout"
                        style={{ fontSize: '0.72rem', color: '#57534E', marginTop: '0.15rem' }}
                      >
                        Editado: {formatearFecha(nota.fechaModificacion)}
                      </div>
                    )}
                  </div>

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
                      className="synth-btn synth-btn-secondary"
                      onClick={() => setNotaAEditar(nota)}
                      title="Editar título, etiqueta o frecuencia"
                    >
                      Editar
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
                      onClick={() => setNotaAEliminar(nota)}
                      title="Eliminar registro permanentemente"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              )
            })}

            {totalPaginas > 1 && (
              <nav className="synth-pagination" aria-label="Paginación de notas">
                <button
                  type="button"
                  className="synth-btn synth-btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={paginaEfectiva <= 1}
                  onClick={() => setPaginaActual((p) => Math.max(1, Math.min(totalPaginas, p - 1)))}
                >
                  &lsaquo; ANTERIOR
                </button>
                <span className="synth-pagination-info">
                  Página {paginaEfectiva} de {totalPaginas}
                </span>
                <button
                  type="button"
                  className="synth-btn synth-btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={paginaEfectiva >= totalPaginas}
                  onClick={() => setPaginaActual((p) => Math.max(1, Math.min(totalPaginas, p + 1)))}
                >
                  SIGUIENTE &rsaquo;
                </button>
              </nav>
            )}
          </div>
        )}
      </section>

      <ConfirmModal
        abierto={notaAEliminar !== null}
        tituloNota={notaAEliminar?.titulo ?? ''}
        confirmando={notaAEliminar !== null && eliminandoId === notaAEliminar.id}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setNotaAEliminar(null)}
      />

      <EditNotaModal
        key={notaAEditar?.id ?? 'cerrado'}
        nota={notaAEditar}
        onCerrar={() => setNotaAEditar(null)}
        onNotaActualizada={onNotaActualizada}
      />
    </>
  )
}
