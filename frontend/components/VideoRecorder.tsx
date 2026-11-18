'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type VideoClip = { blob: Blob; type: string; duration: string; url: string }

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Grava vídeo pela câmera do aparelho (para relatos em Libras): prévia ao vivo, tempo, revisão e descarte.
export function VideoRecorder({ value, onChange, max = 120, onRecording }: { value: VideoClip | null; onChange: (v: VideoClip | null) => void; max?: number; onRecording?: (on: boolean) => void }) {
  const [state, setState] = useState<'idle' | 'ready' | 'rec'>('idle')
  const [secs, setSecs] = useState(0)
  const [erro, setErro] = useState('')
  const live = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const rec = useRef<MediaRecorder | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const started = useRef(0)

  const stopCamera = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); stopCamera() }, [])
  useEffect(() => { onRecording?.(state === 'rec') }, [state, onRecording])
  useEffect(() => { if (state !== 'idle' && live.current && stream.current) live.current.srcObject = stream.current }, [state])

  async function openCamera() {
    setErro('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setErro('Este navegador não grava vídeo. Use “Enviar arquivo”.'); return }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true })
      setState('ready')
    } catch {
      setErro('Sem acesso à câmera. Libere a câmera para este site nas configurações do navegador ou use “Enviar arquivo”.')
    }
  }
  function start() {
    if (!stream.current) return
    const mr = new MediaRecorder(stream.current)
    const chunks: Blob[] = []
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    mr.onstop = () => {
      if (timer.current) clearInterval(timer.current)
      const type = (mr.mimeType || 'video/webm').split(';')[0]
      const blob = new Blob(chunks, { type })
      const s = Math.max(1, Math.round((Date.now() - started.current) / 1000))
      stopCamera(); setState('idle')
      if (blob.size < 1000) { setErro('O vídeo ficou vazio. Tente gravar de novo.'); return }
      onChange({ blob, type, duration: fmt(s), url: URL.createObjectURL(blob) })
    }
    rec.current = mr; started.current = Date.now(); setSecs(0); mr.start(1000); setState('rec')
    timer.current = setInterval(() => { const s = Math.round((Date.now() - started.current) / 1000); setSecs(s); if (s >= max) mr.stop() }, 500)
  }

  if (value) {
    return (
      <div className="stack s8" style={{ flexBasis: '100%' }}>
        <video className="ev-media" src={value.url} controls playsInline aria-label={`Seu vídeo${value.duration ? `, ${value.duration}` : ''}`} />
        <div><button className="btn ghost sm" type="button" onClick={() => { URL.revokeObjectURL(value.url); onChange(null) }}><Icon name="x" />Descartar vídeo</button></div>
      </div>
    )
  }
  if (state === 'idle') {
    return (
      <>
        <button className="btn" type="button" onClick={openCamera}><Icon name="video" />Gravar vídeo</button>
        {erro && <p className="error" role="alert" style={{ flexBasis: '100%' }}>{erro}</p>}
      </>
    )
  }
  return (
    <div className="stack s8" style={{ flexBasis: '100%' }}>
      <video ref={live} className="ev-media cam" autoPlay muted playsInline aria-label="Prévia da câmera" />
      <div className="row wrapr">
        {state === 'ready'
          ? <><button className="btn" type="button" onClick={start}><span className="rec-dot" aria-hidden="true" />Começar a gravar</button>
              <button className="btn ghost sm" type="button" onClick={() => { stopCamera(); setState('idle') }}>Cancelar</button></>
          : <button className="btn rec-on" type="button" onClick={() => rec.current?.stop()}><Icon name="stop" />Parar · {fmt(secs)}</button>}
      </div>
      <span className="sr" aria-live="polite">{state === 'rec' ? 'Gravando vídeo. Toque em parar para terminar.' : 'Câmera aberta. Toque em começar a gravar.'}</span>
      <p className="xs muted">Até {fmt(max)}. Enquadre as mãos e o rosto, com luz de frente.</p>
    </div>
  )
}
