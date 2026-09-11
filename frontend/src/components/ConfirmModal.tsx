interface ConfirmModalProps {
  abierto: boolean
  tituloNota: string
  confirmando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmModal({ abierto, tituloNota, confirmando, onConfirmar, onCancelar }: ConfirmModalProps) {
  if (!abierto) return null

  return (
    <div className="synth-modal-backdrop" role="dialog" aria-modal="true" onClick={onCancelar}>
      <div className="synth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="synth-modal-header">
          <span className="synth-module-title">Confirmar Eliminación</span>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          ¿Seguro que deseás eliminar la nota <strong>«{tituloNota}»</strong>? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="synth-btn synth-btn-secondary"
            onClick={onCancelar}
            disabled={confirmando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="synth-btn"
            style={{
              backgroundColor: '#B71C1C',
              color: '#FFFFFF',
              borderColor: '#B71C1C',
              boxShadow: '2px 2px 0px #1C1917',
            }}
            onClick={onConfirmar}
            disabled={confirmando}
          >
            {confirmando ? 'Borrando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
