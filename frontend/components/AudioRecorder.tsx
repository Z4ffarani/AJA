'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type Recording = { blob: Blob; type: string; duration: string; url: string }

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Grava áudio pelo microfone do aparelho. Anuncia o estado para leitores de tela.
export function AudioRecorder({ value, onChange, max = 180 }: { value: Recording | null; onChange: (r: Recording | null) => void; max?: number }) {
  const [state, setState] = useState<'idle' | 'rec'>('idle')
  const [secs, setSecs] = useState(0)
  const [erro, setErro] = useState('')
  const rec = useRef<MediaRecorder | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const started = useRef(0)

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); rec.current?.stream.getTracks().forEach((t) => t.stop()) }, [])

  async function start() {
    setErro('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setErro('Este navegador não grava áudio. Tente pelo Chrome, Edge ou Safari atualizados.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const chunks: Blob[] = []
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        if (timer.current) clearInterval(timer.current)
        const type = (mr.mimeType || 'audio/webm').split(';')[0]
        const blob = new Blob(chunks, { type })
        const s = Math.max(1, Math.round((Date.now() - started.current) / 1000))
        setState('idle')
        if (blob.size < 200) { setErro('Não captamos som. Confira o microfone e tente de novo.'); return }
        onChange({ blob, type, duration: fmt(s), url: URL.createObjectURL(blob) })
      }
      rec.current = mr
      started.current = Date.now()
      setSecs(0)
      mr.start()
      setState('rec')
      timer.current = setInterval(() => {
        const s = Math.round((Date.now() - started.current) / 1000)
        setSecs(s)
        if (s >= max) mr.stop()
      }, 500)
    } catch {
      setErro('Sem acesso ao microfone. Libere o microfone para este site nas configurações do navegador.')
    }
  }

  if (value) {
    return (
      <div className="rec-box">
        <audio src={value.url} controls aria-label={`Seu áudio, ${value.duration}`} />
        <button className="btn ghost sm" type="button" onClick={() => { URL.revokeObjectURL(value.url); onChange(null) }}><Icon name="x" />Descartar áudio</button>
      </div>
    )
  }
  return (
    <>
      {state === 'rec' ? (
        <button className="btn sm rec-on" type="button" onClick={() => rec.current?.stop()}>
          <span className="rec-dot" aria-hidden="true" /><Icon name="stop" />Parar · {fmt(secs)}
        </button>
      ) : (
        <button className="chip" type="button" onClick={start}><Icon name="mic" size={16} />Gravar áudio</button>
      )}
      <span className="sr" aria-live="polite">{state === 'rec' ? 'Gravando áudio. Toque em parar para terminar.' : ''}</span>
      {erro && <p className="error" role="alert" style={{ flexBasis: '100%' }}>{erro}</p>}
    </>
  )
}
