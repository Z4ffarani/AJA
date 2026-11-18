'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

type Ev = { id: string; format: string; body: string; caption: string }

// Editar ou excluir uma evidência que a própria pessoa enviou. A exclusão pede confirmação na própria tela.
export function EvidenceActions({ ev, slug }: { ev: Ev; slug: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'edit' | 'delete'>('idle')
  const [body, setBody] = useState(ev.body)
  const [caption, setCaption] = useState(ev.caption)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  const hasCaption = ev.format === 'foto' || ev.format === 'mapa'

  async function save() {
    setBusy(true); setErro('')
    const res = await fetch(`/api/relatos/${ev.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hasCaption ? { body, caption } : { body }) })
    setBusy(false)
    if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível salvar.'); return }
    setMode('idle'); router.refresh()
  }
  async function remove() {
    setBusy(true); setErro('')
    const res = await fetch(`/api/relatos/${ev.id}`, { method: 'DELETE' })
    setBusy(false)
    if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível excluir.'); return }
    const out = await res.json()
    if (out.topicDeleted) router.push('/acompanhar?aba=relatos&excluido=1')
    else router.refresh()
  }

  if (mode === 'edit') {
    return (
      <form className="stack s8" onSubmit={(e) => { e.preventDefault(); save() }} aria-label="Editar evidência">
        <div className="field"><label htmlFor={`ev-b-${ev.id}`}>{ev.format === 'audio' ? 'Transcrição' : ev.format === 'libras' ? 'Legenda' : 'Texto'}</label>
          <textarea className="input" id={`ev-b-${ev.id}`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} /></div>
        {hasCaption && <div className="field"><label htmlFor={`ev-c-${ev.id}`}>Descrição da imagem</label>
          <textarea className="input" id={`ev-c-${ev.id}`} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={1000} /></div>}
        {erro && <p className="error" role="alert">{erro}</p>}
        <div className="row wrapr"><button className="btn sm" type="submit" disabled={busy}><Icon name="check" />{busy ? 'Salvando…' : 'Salvar'}</button>
          <button className="btn ghost sm" type="button" onClick={() => { setBody(ev.body); setCaption(ev.caption); setMode('idle') }}>Cancelar</button></div>
      </form>
    )
  }
  if (mode === 'delete') {
    return (
      <div className="notice stack s8" role="group" aria-labelledby={`ev-del-${ev.id}`}>
        <p id={`ev-del-${ev.id}`}><b>Excluir esta evidência?</b> Ela sai do tópico e do dossiê, e não dá para desfazer.</p>
        {erro && <p className="error" role="alert">{erro}</p>}
        <div className="row wrapr"><button className="btn sm danger" type="button" onClick={remove} disabled={busy}><Icon name="trash" />{busy ? 'Excluindo…' : 'Excluir'}</button>
          <button className="btn ghost sm" type="button" onClick={() => setMode('idle')} autoFocus>Cancelar</button></div>
      </div>
    )
  }
  return (
    <div className="row wrapr">
      <span className="badge blue">Enviada por você</span>
      <button className="act" type="button" onClick={() => setMode('edit')}><Icon name="edit" size={16} />Editar<span className="sr"> evidência</span></button>
      <button className="act" type="button" onClick={() => setMode('delete')}><Icon name="trash" size={16} />Excluir<span className="sr"> evidência</span></button>
    </div>
  )
}
