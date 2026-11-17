'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Comment, Thread } from '@/lib/types'
import { Icon } from './Icon'
import { ListenButton } from './ListenButton'

function Body({ c }: { c: Comment }) {
  if (c.kind === 'libras') return <div className="media" style={{ minHeight: 200 }}><span className="seal"><Icon name="hand" size={16} />{c.mediaLabel ?? 'Vídeo em Libras'}</span><span className="cap"><b>Legenda:</b> “{c.body}”</span></div>
  if (c.kind === 'audio') return (
    <div className="card flat" style={{ padding: 12, gap: 10 }}>
      <div className="row"><span className="iconbtn" aria-hidden="true" style={{ background: 'var(--primary)', color: 'var(--onprimary)', borderColor: 'var(--primary)' }}><Icon name="mic" /></span><span className="small muted">Comentário em áudio · {c.mediaLabel}</span></div>
      <p className="small"><b>Transcrição:</b> “{c.body}”</p>
    </div>
  )
  return <p>{c.body}</p>
}

function Item({ c, onHelpful, onReply, children }: { c: Comment; onHelpful: (id: string) => void; onReply?: () => void; children?: React.ReactNode }) {
  return (
    <article className="cm" aria-label={`Comentário de ${c.author}`}>
      <span className="avatar" aria-hidden="true">{c.initials}</span>
      <div className="cm-head"><b>{c.author}</b>{c.badge && <span className={`badge ${/volunt/i.test(c.badge) ? 'green' : c.badge === 'Autora' || c.badge === 'Autor' ? 'gray' : 'blue'}`}>{c.badge}</span>}<span className="dot" aria-hidden="true">·</span><span className="small muted">{c.ago}</span></div>
      <div className="cm-body"><Body c={c} /></div>
      <div className="cm-actions">
        <button className={`act${c.mineHelpful ? ' on' : ''}`} type="button" aria-pressed={c.mineHelpful} onClick={() => onHelpful(c.id)}><Icon name="up" />Útil · {c.helpful}</button>
        {onReply && <button className="act" type="button" onClick={onReply}><Icon name="reply" />Responder</button>}
        <ListenButton text={`${c.author} disse: ${c.body}`} className="act" iconOnly label="Ouvir" />
      </div>
      {children}
    </article>
  )
}

export function Comments({ slug, initial, logged }: { slug: string; initial: Thread[]; logged: boolean }) {
  const [threads, setThreads] = useState(initial)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [order, setOrder] = useState<'uteis' | 'recentes'>('uteis')
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const path = usePathname()
  const total = threads.reduce((n, t) => n + 1 + t.replies.length, 0)

  async function post(body: string, parentId?: string) {
    if (!body.trim()) return false
    setBusy(true); setErro('')
    const res = await fetch(`/api/topicos/${slug}/comentarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body, parentId }) })
    setBusy(false)
    if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível publicar.'); return false }
    setThreads(await res.json())
    if (parentId) setOpen((o) => ({ ...o, [parentId]: true }))
    setReplyTo(null)
    return true
  }
  async function helpful(id: string) {
    if (!logged) { window.location.href = `/entrar?voltar=${encodeURIComponent(path)}`; return }
    const res = await fetch(`/api/comentarios/${id}/util`, { method: 'PUT' })
    if (!res.ok) return
    const { helpful, mine } = await res.json()
    const upd = (c: Comment) => (c.id === id ? { ...c, helpful, mineHelpful: mine } : c)
    setThreads((ts) => ts.map((t) => ({ ...upd(t), replies: t.replies.map(upd) }) as Thread))
  }
  const sorted = order === 'uteis' ? threads : [...threads].reverse()

  return (
    <div className="stack s24">
      {logged ? (
        <form className="card" aria-label="Escrever comentário" onSubmit={async (e) => { e.preventDefault(); const f = e.currentTarget; if (await post(String(new FormData(f).get('body') ?? ''))) f.reset() }}>
          <label className="h4" htmlFor="c1">Participe da conversa</label>
          <textarea className="input" id="c1" name="body" maxLength={2000} required placeholder="Conte sua experiência, sugira uma solução ou tire uma dúvida" />
          <div className="row wrapr">
            <Link className="chip" href={`/relatar?topico=${slug}&formato=audio`}><Icon name="mic" size={16} />Áudio</Link>
            <Link className="chip" href={`/relatar?topico=${slug}&formato=libras`}><Icon name="hand" size={16} />Vídeo em Libras</Link>
            <Link className="chip" href={`/relatar?topico=${slug}&formato=foto`}><Icon name="camera" size={16} />Foto</Link>
            <span className="grow" />
            <button className="btn sm" type="submit" disabled={busy}><Icon name="send" />Publicar</button>
          </div>
          {erro && <p className="error" role="alert">{erro}</p>}
        </form>
      ) : (
        <div className="card soft"><p><b>Quer participar da conversa?</b> <Link href={`/entrar?voltar=${encodeURIComponent(path)}`}>Entre na sua conta</Link> para comentar e marcar comentários como úteis.</p></div>
      )}
      <div className="row sb wrapr">
        <h2 className="h3">{total} comentários em {threads.length} conversas</h2>
        <div className="seg" role="group" aria-label="Ordenar">
          {(['uteis', 'recentes'] as const).map((o) => (
            <button key={o} type="button" aria-pressed={order === o} onClick={() => setOrder(o)} className={order === o ? 'on' : undefined}>
              {o === 'uteis' ? 'Mais úteis' : 'Recentes'}
            </button>
          ))}
        </div>
      </div>
      {sorted.map((t) => {
        const shown = open[t.id] ? t.replies : t.replies.slice(0, 2)
        const hidden = t.replies.length - shown.length
        return (
          <section className="thread" key={t.id}>
            <Item c={t} onHelpful={helpful} onReply={logged ? () => setReplyTo(replyTo === t.id ? null : t.id) : undefined}>
              {(t.replies.length > 0 || replyTo === t.id) && (
                <div className="replies" role="group" aria-label={`${t.replies.length} respostas`}>
                  {shown.map((r) => <Item key={r.id} c={r} onHelpful={helpful} />)}
                  {hidden > 0 && <button className="more-replies" type="button" onClick={() => setOpen((o) => ({ ...o, [t.id]: true }))}><Icon name="caretdown" />Ver mais {hidden} {hidden === 1 ? 'resposta' : 'respostas'}</button>}
                  {replyTo === t.id && (
                    <form className="stack s8" onSubmit={async (e) => { e.preventDefault(); const f = e.currentTarget; if (await post(String(new FormData(f).get('body') ?? ''), t.id)) f.reset() }}>
                      <label className="sr" htmlFor={`r-${t.id}`}>Responder a {t.author}</label>
                      <textarea className="input" id={`r-${t.id}`} name="body" maxLength={2000} required placeholder={`Responder a ${t.author}`} style={{ minHeight: 80 }} autoFocus />
                      <div className="row"><button className="btn sm" type="submit" disabled={busy}><Icon name="send" />Responder</button><button className="btn sec sm" type="button" onClick={() => setReplyTo(null)}>Cancelar</button></div>
                    </form>
                  )}
                </div>
              )}
            </Item>
            <div className="thread-meta"><Icon name="thread" size={16} />{t.replies.length ? `${t.replies.length} ${t.replies.length === 1 ? 'resposta' : 'respostas'} · última ${t.lastReplyAgo}` : 'Sem respostas ainda'}</div>
          </section>
        )
      })}
    </div>
  )
}
