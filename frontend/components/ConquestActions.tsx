'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export function ConquestActions({ slug, ok, notOk }: { slug: string; ok: number; notOk: number }) {
  const [c, setC] = useState({ ok, notOk })
  const [mine, setMine] = useState<boolean | null>(null)
  const [stars, setStars] = useState(0)
  const [msg, setMsg] = useState('')
  const router = useRouter()
  async function call(path: string, body: object) {
    const res = await fetch(`/api/topicos/${slug}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.status === 401) { router.push(`/entrar?voltar=/conquistas`); return null }
    return res.ok ? res.json() : null
  }
  return (
    <section className="card soft" aria-labelledby="ainda-t">
      <h3 className="h3" id="ainda-t">A barreira continua resolvida?</h3>
      <p className="small">Passou por ali recentemente? Sua resposta mantém a conquista verificada ao longo do tempo.</p>
      <div className="row wrapr">
        <button className="btn green" type="button" aria-pressed={mine === true} onClick={async () => { const t = await call('verificacao', { stillOk: true }); if (t) { setC({ ok: t.verifiedOk, notOk: t.verifiedNotOk }); setMine(true); setMsg('Obrigado por verificar!') } }}><Icon name="check" />Sim, continua ok · {c.ok}</button>
        <button className="btn sec" type="button" aria-pressed={mine === false} onClick={async () => { const t = await call('verificacao', { stillOk: false }); if (t) { setC({ ok: t.verifiedOk, notOk: t.verifiedNotOk }); setMine(false); setMsg('Registrado. Com mais confirmações, o tópico é reaberto.') } }}><Icon name="alert" />Voltou a ter problema · {c.notOk}</button>
      </div>
      <fieldset className="row wrapr" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="small" style={{ marginBottom: 6 }}><b>Sua avaliação</b></legend>
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" className="iconbtn" aria-label={`${s} ${s === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={stars === s}
            style={{ color: s <= stars ? 'var(--amber)' : 'var(--muted)' }} onClick={async () => { const t = await call('avaliacao', { stars: s }); if (t) { setStars(s); setMsg('Avaliação registrada.') } }}><Icon name="star" /></button>
        ))}
      </fieldset>
      <p className="small c-green" aria-live="polite">{msg}</p>
    </section>
  )
}
