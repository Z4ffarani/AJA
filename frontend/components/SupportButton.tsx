'use client'
import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from './Icon'

type State = { supports: number; passes: number; mine: { passesBy: boolean } | null }

function useSupport(slug: string, initial: State) {
  const [s, setS] = useState(initial)
  const [pending, start] = useTransition()
  const [erro, setErro] = useState('')
  const router = useRouter()
  const path = usePathname()
  async function send(next: { passesBy: boolean } | null) {
    setErro('')
    const res = await fetch(`/api/topicos/${slug}/apoio`, next
      ? { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }
      : { method: 'DELETE' })
    if (res.status === 401) { router.push(`/entrar?voltar=${encodeURIComponent(path)}`); return }
    if (!res.ok) { setErro('Não deu para registrar agora. Tente de novo.'); return }
    const t = await res.json()
    setS({ supports: t.supports, passes: t.passes, mine: t.mySupport })
    start(() => router.refresh())
  }
  return { s, pending, erro, send }
}

// Coluna de apoio do cartão (computador).
export function VoteBox({ slug, initial }: { slug: string; initial: State }) {
  const { s, send } = useSupport(slug, initial)
  const on = Boolean(s.mine)
  return (
    <div className={`vote${on ? ' voted' : ''}`}>
      <button className="box" type="button" aria-pressed={on} onClick={() => send(on ? null : { passesBy: false })}>
        <Icon name="up" /><span className="n">{s.supports}</span>{' '}<span className="t">apoios</span><span className="sr">. {on ? 'Você apoia' : 'Apoiar'} esta melhoria</span>
      </button>
      <span className="aff">{s.passes} passam por ali</span>
    </div>
  )
}

// Linha de apoio do cartão (celular).
export function VotePill({ slug, initial }: { slug: string; initial: State }) {
  const { s, send } = useSupport(slug, initial)
  const on = Boolean(s.mine)
  return (
    <div className="mvote">
      <button className={`btn sm${on ? '' : ' apo'}`} type="button" aria-pressed={on} onClick={() => send(on ? null : { passesBy: false })}>
        <Icon name={on ? 'check' : 'up'} />{on ? 'Apoiando' : 'Apoiar'} · {s.supports}
      </button>
      <span className="small muted grow">{s.passes} passam por ali</span>
    </div>
  )
}

// Cartão de apoio do tópico, com a marcação "Passo por essa barreira".
export function SupportCard({ slug, initial }: { slug: string; initial: State }) {
  const { s, send, erro } = useSupport(slug, initial)
  const on = Boolean(s.mine)
  const passes = Boolean(s.mine?.passesBy)
  return (
    <section className="card" aria-labelledby="apoio-t">
      <h2 className="ch" id="apoio-t"><Icon name="up" />Apoio</h2>
      <p className="row"><span className="num">{s.supports}</span><span className="muted">apoios · <b style={{ color: 'var(--ink)' }}>{s.passes}</b> passam por ali</span></p>
      <button className={`btn full${on ? '' : ''}`} type="button" aria-pressed={on} onClick={() => send(on ? null : { passesBy: passes })}>
        <Icon name={on ? 'check' : 'up'} />{on ? 'Você apoia esta melhoria' : 'Apoiar esta melhoria'}
      </button>
      <button className="btn sec full pass" type="button" aria-pressed={passes} onClick={() => send({ passesBy: !passes })}>
        <Icon name="piso" />{passes ? 'Você passa por essa barreira' : 'Passo por essa barreira'}{passes && <Icon name="check" size={16} />}
      </button>
      <p className="small muted">Opcional. Conta como confirmação de que a barreira existe e ajuda o tópico a avançar.</p>
      {erro && <p className="small c-red" role="alert">{erro}</p>}
      <p className="xs muted">Apoio mostra mobilização, mas não é condição para a barreira ser atendida.</p>
    </section>
  )
}

// Rodapé fixo do celular no tópico.
export function SupportFoot({ slug, initial }: { slug: string; initial: State }) {
  const { s, send } = useSupport(slug, initial)
  const on = Boolean(s.mine)
  const passes = Boolean(s.mine?.passesBy)
  return (
    <div className="foot" role="region" aria-label="Ações rápidas"><div className="row">
      <button className="btn grow" type="button" aria-pressed={on} onClick={() => send(on ? null : { passesBy: passes })}><Icon name={on ? 'check' : 'up'} />{on ? 'Apoiando' : 'Apoiar'} · {s.supports}</button>
      <button className="btn sec pass" type="button" aria-pressed={passes} onClick={() => send({ passesBy: !passes })}><Icon name="piso" />Passo por ali{passes && <Icon name="check" size={16} />}</button>
    </div></div>
  )
}
