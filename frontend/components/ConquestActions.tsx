'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from './Icon'

// Avaliar já confirma que a melhoria continua lá. "Voltou a ter problema" é o caminho à parte.
export function ConquestActions({ slug, ok, notOk, rating, ratings, supports }: { slug: string; ok: number; notOk: number; rating?: number; ratings?: number; supports?: number }) {
  const [c, setC] = useState({ ok, notOk })
  const [avg, setAvg] = useState(rating === undefined ? null : { rating, ratings: ratings ?? 0 })
  const [stars, setStars] = useState(0)
  const [broken, setBroken] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()
  const here = usePathname()
  async function call(endpoint: string, body: object) {
    const res = await fetch(`/api/topicos/${slug}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.status === 401) { router.push(`/entrar?voltar=${encodeURIComponent(here)}`); return null }
    return res.ok ? res.json() : null
  }
  return (
    <section className="card soft" aria-labelledby={`ainda-${slug}`}>
      <h2 className="ch" id={`ainda-${slug}`}><Icon name="star" />Avaliação</h2>
      {avg && <p className="row"><span className="num">{avg.rating.toLocaleString('pt-BR')}</span><span className="muted">de 5 · {avg.ratings} {avg.ratings === 1 ? 'avaliação' : 'avaliações'}</span></p>}
      {supports !== undefined && <p className="small muted">{supports} pessoas apoiaram esta melhoria antes de ela sair do papel.</p>}
      <hr className="hr" />
      <h3 className="h4">Passou por ali? Avalie a melhoria</h3>
      <p className="small">Sua avaliação também confirma que a conquista continua de pé. {c.ok > 0 && <span className="muted">{c.ok} {c.ok === 1 ? 'pessoa confirmou' : 'pessoas confirmaram'}.</span>}</p>
      <fieldset className="row wrapr" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr">Sua avaliação, de 1 a 5 estrelas</legend>
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" className="iconbtn" aria-label={`${s} ${s === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={stars === s}
            style={{ color: s <= stars ? 'var(--amber)' : 'var(--muted)' }}
            onClick={async () => { const t = await call('avaliacao', { stars: s }); if (t) { setStars(s); setBroken(false); setC({ ok: t.verifiedOk, notOk: t.verifiedNotOk }); if (avg) setAvg({ rating: t.rating, ratings: t.ratings }); setMsg('Avaliação registrada. Obrigado por confirmar!') } }}><Icon name="star" /></button>
        ))}
      </fieldset>
      <button className="btn sec sm" type="button" aria-pressed={broken} style={{ alignSelf: 'flex-start' }}
        onClick={async () => { const t = await call('verificacao', { stillOk: false }); if (t) { setBroken(true); setC({ ok: t.verifiedOk, notOk: t.verifiedNotOk }); setMsg('Registrado. Com mais confirmações, o tópico é reaberto.') } }}>
        <Icon name="alert" />Voltou a ter problema{c.notOk > 0 ? ` · ${c.notOk}` : ''}</button>
      <p className="small c-green" aria-live="polite">{msg}</p>
    </section>
  )
}
