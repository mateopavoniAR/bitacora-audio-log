import { useState } from 'react'
import './App.css'
// Importamos los contratos de tipos derivados de API_CONTRACT.md
import type { NotaAudio, CreateNotaAudioDto } from './types/notaAudio'

/**
 * Componente principal de la consola de audio (Fase 1: Escafolding, Tipos y Estilos Base).
 * Implementa la paleta analógica (marfil, rojo audaz y tipografía monoespaciada para Hz).
 */
function App() {
  // Estado de ejemplo para verificar reactividad y tipado
  const [frecuenciaActiva, setFrecuenciaActiva] = useState<number>(440.0)

  // Datos mock tipados para validar la interfaz NotaAudio en tiempo de compilación
  const notasEjemplo: NotaAudio[] = [
    {
      id: 1,
      titulo: 'Tono de Calibración A4',
      etiqueta: 'Calibración',
      frecuenciaHz: 440.0,
      fechaCreacion: new Date().toISOString(),
    },
    {
      id: 2,
      titulo: 'Referencia Sub-graves',
      etiqueta: 'Prueba Acústica',
      frecuenciaHz: 60.0,
      fechaCreacion: new Date().toISOString(),
    },
    {
      id: 3,
      titulo: 'Tono Estándar 1 kHz',
      etiqueta: 'Alineación',
      frecuenciaHz: 1000.0,
      fechaCreacion: new Date().toISOString(),
    },
  ]

  // Estructura de ejemplo para validar el DTO de creación
  const nuevoBorrador: CreateNotaAudioDto = {
    titulo: 'Barrido de Alta Frecuencia',
    etiqueta: 'Agudos',
    frecuenciaHz: 12000.0,
  }

  return (
    <main className="synth-container">
      {/* Cabecera de la consola con estilo de hardware analógico */}
      <header className="synth-header">
        <div>
          <div className="synth-subtitle">Audio Log &amp; Calibration Console</div>
          <h1 className="synth-title">
            <span className="synth-title-dot" aria-hidden="true"></span>
            Bitácora de Sesiones
          </h1>
        </div>
        <div className="synth-badge">Fase 1: Base Synth &amp; Types</div>
      </header>

      {/* Grilla modular de racks */}
      <div className="synth-grid">
        {/* Módulo 1: Monitor de Frecuencia y Display Digital */}
        <section className="synth-panel-accent">
          <div className="synth-module-header">
            <span className="synth-module-title">Frecuencímetro Activo</span>
            <span className="synth-badge">OSC-01</span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div className="synth-display synth-hz-readout">
              {frecuenciaActiva.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>Hz</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--synth-text-muted)', marginBottom: '1.25rem' }}>
            Seleccione una frecuencia de prueba registrada o use los controles rápidos:
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="synth-btn"
              onClick={() => setFrecuenciaActiva(440.0)}
            >
              440 Hz (A4)
            </button>
            <button
              type="button"
              className="synth-btn synth-btn-secondary"
              onClick={() => setFrecuenciaActiva(1000.0)}
            >
              1 kHz
            </button>
            <button
              type="button"
              className="synth-btn synth-btn-secondary"
              onClick={() => setFrecuenciaActiva(60.0)}
            >
              60 Hz
            </button>
          </div>
        </section>

        {/* Módulo 2: Registro de Notas Tipadas */}
        <section className="synth-panel">
          <div className="synth-module-header">
            <span className="synth-module-title">Notas Registradas (Mock Contract)</span>
            <span className="synth-hz-readout" style={{ fontSize: '0.8rem', color: 'var(--synth-text-muted)' }}>
              {notasEjemplo.length} ENTRADAS
            </span>
          </div>

          <div className="synth-sample-list">
            {notasEjemplo.map((nota) => (
              <div key={nota.id} className="synth-sample-item">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>{nota.titulo}</strong>
                  <span className="synth-badge" style={{ marginTop: '0.25rem' }}>
                    {nota.etiqueta}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="synth-hz-readout" style={{ fontWeight: 700, color: 'var(--synth-red-primary)' }}>
                    {nota.frecuenciaHz} Hz
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className="synth-btn synth-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setFrecuenciaActiva(nota.frecuenciaHz)}
                    >
                      Cargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #E7E0D6', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--synth-text-muted)' }}>
              Próximo borrador a registrar (CreateNotaAudioDto):{' '}
              <strong>{nuevoBorrador.titulo}</strong> ({nuevoBorrador.frecuenciaHz} Hz)
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
