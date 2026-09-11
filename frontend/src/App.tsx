import { useState, useEffect, useCallback } from 'react'
import './App.css'
import type { NotaAudio } from './types/notaAudio'
import { getNotas, deleteNota } from './services/api'
import { reproducirTono } from './utils/audioSynth'
import { NotaForm } from './components/NotaForm'
import { NotaList } from './components/NotaList'

/**
 * Componente principal de la consola de audio (Fase 3: Lista de Notas y UI Principal Synth).
 */
function App() {
  // Colección de notas obtenidas desde la base de datos a través de la API
  const [notas, setNotas] = useState<NotaAudio[]>([])
  
  // Estados para controlar la carga y posibles errores de conexión
  const [cargando, setCargando] = useState<boolean>(true)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  // Frecuencia activa en el monitor de oscilador
  const [frecuenciaActiva, setFrecuenciaActiva] = useState<number>(440.0)

  // Función para obtener las notas desde el backend .NET
  const cargarNotas = useCallback(async () => {
    try {
      setCargando(true)
      setErrorServidor(null)
      const datos = await getNotas()
      setNotas(datos)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorServidor(err.message)
      } else {
        setErrorServidor('No se pudo establecer conexión con el servidor backend.')
      }
    } finally {
      setCargando(false)
    }
  }, [])

  // Efecto inicial: cargar las notas al montar el componente
  useEffect(() => {
    cargarNotas()
  }, [cargarNotas])

  // Recarga automática al crear una nueva nota desde NotaForm
  const handleNotaCreada = (nuevaNota: NotaAudio) => {
    // Agregamos la nueva nota al inicio de la lista de manera reactiva
    setNotas((prev) => [nuevaNota, ...prev])
    setFrecuenciaActiva(nuevaNota.frecuenciaHz)
  }

  // Eliminación de una nota comunicándose con DELETE /api/notasaudio/{id}
  const handleEliminarNota = async (id: number) => {
    try {
      await deleteNota(id)
      // Filtramos la nota eliminada del estado local
      setNotas((prev) => prev.filter((nota) => nota.id !== id))
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al intentar eliminar'
      alert(`No se pudo eliminar la nota: ${mensaje}`)
    }
  }

  // Reproducir un tono sonoro y actualizar la pantalla digital
  const dispararTono = (frecuenciaHz: number) => {
    setFrecuenciaActiva(frecuenciaHz)
    reproducirTono(frecuenciaHz, 1.2)
  }

  return (
    <main className="synth-container">
      {/* 1. Cabecera estilo chasis de hardware analógico */}
      <header className="synth-header">
        <div>
          <div className="synth-subtitle">Acoustic Calibration &amp; Session Console</div>
          <h1 className="synth-title">
            <span className="synth-title-dot" aria-hidden="true"></span>
            Bitácora de Sesiones &amp; Audio Log
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="synth-btn synth-btn-secondary"
            onClick={cargarNotas}
            disabled={cargando}
            title="Refrescar lista desde la base de datos"
          >
            {cargando ? 'Cargando...' : 'Actualizar'}
          </button>
          <span className="synth-badge">VITE + .NET 8</span>
        </div>
      </header>

      {/* Banner de advertencia si la API no responde */}
      {errorServidor && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#FFEBEE',
            border: '2px solid #D32F2F',
            boxShadow: '3px 3px 0px #1C1917',
            marginBottom: '1.5rem',
            borderRadius: '2px',
          }}
        >
          <strong style={{ color: '#B71C1C', display: 'block', marginBottom: '0.25rem' }}>
            Aviso de Conexión con el Backend
          </strong>
          <p style={{ fontSize: '0.875rem', color: '#1C1917' }}>
            {errorServidor}. Verificá que el backend esté corriendo en <code>http://localhost:8080</code>.
          </p>
        </div>
      )}

      {/* 2. Módulo Superior: Oscilador y Monitor de Frecuencia */}
      <section className="synth-panel-accent" style={{ marginBottom: '2rem' }}>
        <div className="synth-module-header">
          <span className="synth-module-title">Generador Acústico &amp; Frecuencímetro</span>
          <span className="synth-badge">OSC-01 • SINE WAVE</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Display digital vintage */}
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--synth-text-muted)', marginBottom: '0.25rem' }}>
              FRECUENCIA SINTETIZADA
            </span>
            <div className="synth-display synth-hz-readout" style={{ minWidth: '180px' }}>
              {frecuenciaActiva.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>Hz</span>
            </div>
          </div>

          {/* Botón principal de reproducción */}
          <div>
            <button
              type="button"
              className="synth-btn"
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              onClick={() => dispararTono(frecuenciaActiva)}
              title="Disparar onda senoidal mediante Web Audio API"
            >
              Sintetizar Tono ({frecuenciaActiva.toFixed(0)} Hz)
            </button>
          </div>

          {/* Presets rápidos analógicos */}
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--synth-text-muted)', marginBottom: '0.25rem' }}>
              CALIBRACIONES ESTÁNDAR
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={() => dispararTono(60.0)}
              >
                60 Hz
              </button>
              <button
                type="button"
                className="synth-btn synth-btn-secondary"
                onClick={() => dispararTono(440.0)}
              >
                440 Hz (A4)
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
                onClick={() => dispararTono(5000.0)}
              >
                5 kHz
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grilla Principal: Formulario a la izquierda y Listado a la derecha */}
      <div className="synth-grid">
        {/* Columna Izquierda: Formulario de Registro */}
        <div>
          <NotaForm onNotaRegistrada={handleNotaCreada} />
        </div>

        {/* Columna Derecha: Listado de Notas Persistidas */}
        <div>
          <NotaList
            notas={notas}
            cargando={cargando}
            onEliminarNota={handleEliminarNota}
            onSeleccionarNota={(hz) => setFrecuenciaActiva(hz)}
          />
        </div>
      </div>
    </main>
  )
}

export default App
