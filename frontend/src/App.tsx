import { useState } from 'react'
import './App.css'
// Importamos los contratos de tipos derivados de API_CONTRACT.md
import type { NotaAudio } from './types/notaAudio'
// Importamos el helper de Web Audio API y el componente de formulario
import { reproducirTono } from './utils/audioSynth'
import { NotaForm } from './components/NotaForm'

/**
 * Consola Principal de Audio Log (Fase 2: Cliente API, Web Audio Synth y Formulario)
 */
function App() {
  // Frecuencia activa en el oscilador/display digital
  const [frecuenciaActiva, setFrecuenciaActiva] = useState<number>(440.0)

  // Listado de notas en memoria (inicializadas con datos mock para previsualizar)
  const [notasList, setNotasList] = useState<NotaAudio[]>([
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
  ])

  // Función para reproducir el tono en el sintetizador y actualizar el display
  const dispararTono = (frecuencia: number) => {
    setFrecuenciaActiva(frecuencia)
    reproducirTono(frecuencia, 1.2)
  }

  // Callback ejecutado cuando NotaForm registra una nota con éxito
  const handleNotaCreada = (nuevaNota: NotaAudio) => {
    setNotasList((prev) => [nuevaNota, ...prev])
    setFrecuenciaActiva(nuevaNota.frecuenciaHz)
  }

  return (
    <main className="synth-container">
      {/* Cabecera estilo chasis de hardware analógico */}
      <header className="synth-header">
        <div>
          <div className="synth-subtitle">Audio Log &amp; Calibration Console</div>
          <h1 className="synth-title">
            <span className="synth-title-dot" aria-hidden="true"></span>
            Bitácora de Sesiones
          </h1>
        </div>
        <div className="synth-badge">Fase 2: Synth &amp; API Client</div>
      </header>

      {/* Grilla modular de la consola */}
      <div className="synth-grid">
        {/* Columna Izquierda: Formulario de Registro */}
        <div>
          <NotaForm onNotaRegistrada={handleNotaCreada} />
        </div>

        {/* Columna Derecha: Monitor del Oscilador y Listado de Frecuencias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Módulo Monitor de Frecuencia / Oscilador */}
          <section className="synth-panel-accent">
            <div className="synth-module-header">
              <span className="synth-module-title">Oscilador &amp; Frecuencímetro</span>
              <span className="synth-badge">OSC-01</span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div className="synth-display synth-hz-readout">
                {frecuenciaActiva.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>Hz</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--synth-text-muted)', marginBottom: '1rem' }}>
              Haga clic para sintetizar el tono en tiempo real con Web Audio API:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="synth-btn"
                onClick={() => dispararTono(frecuenciaActiva)}
              >
                Sonar ({frecuenciaActiva.toFixed(0)} Hz)
              </button>
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={() => dispararTono(440.0)}
              >
                440 Hz
              </button>
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={() => dispararTono(1000.0)}
              >
                1 kHz
              </button>
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={() => dispararTono(60.0)}
              >
                60 Hz
              </button>
            </div>
          </section>

          {/* Módulo Listado de Notas */}
          <section className="synth-panel">
            <div className="synth-module-header">
              <span className="synth-module-title">Sesiones Registradas</span>
              <span className="synth-hz-readout" style={{ fontSize: '0.8rem', color: 'var(--synth-text-muted)' }}>
                {notasList.length} ENTRADAS
              </span>
            </div>

            <div className="synth-sample-list">
              {notasList.map((nota) => (
                <div key={nota.id} className="synth-sample-item">
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{nota.titulo}</strong>
                    {nota.etiqueta && (
                      <span className="synth-badge" style={{ marginTop: '0.25rem' }}>
                        {nota.etiqueta}
                      </span>
                    )}
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
                        onClick={() => dispararTono(nota.frecuenciaHz)}
                        title="Cargar y reproducir tono"
                      >
                        Reproducir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
