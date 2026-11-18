'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AudioRecorder, type Recording } from './AudioRecorder'
import { Icon } from './Icon'

// Fale com a gente: problema ou sugestão sobre o próprio AJA, em texto ou áudio. Não precisa de conta.
export function FeedbackForm() {
  const [audio, setAudio] = useState<Recording | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const page = usePathname()
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    const body = String(new FormData(f).get('body') ?? '').trim()
    if (!body && !audio) { setMsg({ ok: false, text: 'Escreva ou grave sua mensagem.' }); return }
    setBusy(true); setMsg(null)
    const fd = new FormData()
    fd.append('body', body)
    fd.append('page', page)
    if (audio) fd.append('audio', audio.blob, `mensagem.${audio.type.split('/')[1] || 'webm'}`)
    const res = await fetch('/api/fale-conosco', { method: 'POST', body: fd }).catch(() => null)
    setBusy(false)
    if (res?.ok) { f.reset(); if (audio) URL.revokeObjectURL(audio.url); setAudio(null); setMsg({ ok: true, text: 'Mensagem enviada. Obrigado por ajudar a melhorar o AJA!' }) }
    else setMsg({ ok: false, text: (await res?.json().catch(() => null))?.erro ?? 'Não foi possível enviar agora. Tente de novo.' })
  }
  return (
    <section className="card flat" aria-labelledby="fale">
      <h2 className="ch" id="fale"><Icon name="chat" />Fale com a gente</h2>
      <p className="small">Algo no AJA não funcionou com seu leitor de tela, teclado ou Libras? Tem uma sugestão? Conte para a equipe.</p>
      <form className="stack s8" onSubmit={send}>
        <label className="sr" htmlFor="fale-body">Sua mensagem</label>
        <textarea className="input" id="fale-body" name="body" maxLength={3000} placeholder={audio ? 'Se quiser, escreva o que disse no áudio' : 'Escreva aqui ou grave um áudio'} style={{ minHeight: 90 }} />
        <AudioRecorder value={audio} onChange={setAudio} />
        <button className="btn sec full sm" type="submit" disabled={busy}><Icon name="send" />{busy ? 'Enviando…' : 'Enviar para a equipe'}</button>
        <p className={`small ${msg?.ok ? 'c-green' : 'c-red'}`} aria-live="polite">{msg?.text}</p>
      </form>
      <p className="xs muted">Para relatar uma barreira na rua, use Relatar.</p>
    </section>
  )
}
