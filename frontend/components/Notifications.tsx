'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Notificacao } from '@/lib/types'
import { Icon, type IconName } from './Icon'

const KIND: Record<string, IconName> = { apoio: 'up', comentario: 'chat', resposta: 'chat', util: 'up', aviso: 'bell' }

// Lista de notificações. As novas ficam destacadas nesta visita, e o contador do cabeçalho zera.
export function Notifications({ items }: { items: Notificacao[] }) {
  const router = useRouter()
  const [fresh] = useState(() => new Set(items.filter((n) => !n.read).map((n) => n.id)))
  useEffect(() => {
    if (!fresh.size) return
    fetch('/api/notificacoes/lidas', { method: 'POST' }).then(() => router.refresh()).catch(() => {})
  }, [fresh, router])

  if (!items.length) {
    return (
      <div className="card empty">
        <p>Nenhuma notificação ainda. Quando alguém apoiar o seu relato, comentar nele ou responder você, aparece aqui.</p>
      </div>
    )
  }
  return (
    <section className="card" aria-labelledby="notif-t" style={{ padding: 8 }}>
      <h2 className="sr" id="notif-t">Notificações</h2>
      <p className="sr" aria-live="polite">{fresh.size ? `${fresh.size} ${fresh.size === 1 ? 'notificação nova' : 'notificações novas'}` : ''}</p>
      {items.map((n) => {
        const isNew = fresh.has(n.id)
        const inner = (
          <>
            <span className="who" aria-hidden="true">{n.actor ? n.actor.trim()[0]?.toUpperCase() : <Icon name={KIND[n.kind] ?? 'bell'} />}</span>
            <span className="stack s4 grow">
              <b>{isNew && <span className="sr">Nova: </span>}{n.title}</b>
              {n.body && <span className="small">{n.kind === 'apoio' ? n.body : `“${n.body}”`}</span>}
              <span className="xs muted">{n.topic ? `${n.topic} · ` : ''}{n.ago}</span>
            </span>
            {isNew && <span className="dot" aria-hidden="true" />}
          </>
        )
        return n.href
          ? <Link key={n.id} className={`notif${isNew ? ' new' : ''}`} href={n.href}>{inner}</Link>
          : <div key={n.id} className={`notif${isNew ? ' new' : ''}`}>{inner}</div>
      })}
    </section>
  )
}
