import { useEffect, useRef, useState } from 'react'

interface AutoDismissAlertProps {
  mensaje: string
  tipo: 'success' | 'error'
  onDismiss?: () => void
}

export function AutoDismissAlert({ mensaje, tipo, onDismiss }: AutoDismissAlertProps) {
  const [visible, setVisible] = useState(true)
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  })

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setVisible(false), 3500)
    const dismissTimer = window.setTimeout(() => onDismissRef.current?.(), 4000)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [mensaje, tipo])

  if (!mensaje) return null

  return (
    <div
      role="alert"
      className={`synth-alert synth-alert-${tipo} ${visible ? 'synth-alert-visible' : ''}`}
    >
      <span>{tipo === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{mensaje}</span>
    </div>
  )
}
