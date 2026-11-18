'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MAX_TEXTO, type Prefs } from '@/lib/types'
import { Icon } from './Icon'
import { Toggle } from './Toggle'
import { FeedbackForm } from './FeedbackForm'

export function A11yPanel({ initial, askAja }: { initial: Prefs; askAja: React.ReactNode }) {
  const [p, setP] = useState(initial)
  const router = useRouter()
  function save(next: Partial<Prefs>) {
    const merged = { ...p, ...next }
    setP(merged)
    document.cookie = `aja_prefs=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }
  const temas: [Prefs['tema'], string][] = [['claro', 'Claro'], ['escuro', 'Escuro'], ['auto', 'Automático']]
  return (
    <div className="grid">
      <div className="stack">
        <section className="card"><h2 className="ch"><Icon name="sun" />Tema</h2>
          <div className="seg" role="radiogroup" aria-label="Tema">
            {temas.map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={p.tema === k} onClick={() => save({ tema: k })}>{l}</button>
            ))}
          </div>
          <p className="xs muted">Automático segue o tema do seu aparelho.</p>
        </section>
        <section className="card"><h2 className="ch"><Icon name="text" />Tamanho do texto</h2>
          <div className="row"><span className="small" aria-hidden="true">A</span>
            <input type="range" min={100} max={MAX_TEXTO} step={10} value={Math.min(p.texto, MAX_TEXTO)} onChange={(e) => save({ texto: Number(e.target.value) })} aria-label="Tamanho do texto" aria-valuetext={`${p.texto}%`} className="grow" style={{ accentColor: 'var(--primary)', height: 32 }} />
            <span className="h3" aria-hidden="true">A</span><b>{p.texto}%</b></div>
        </section>
        <section className="card"><h2 className="ch"><Icon name="eye" />Visão</h2>
          <Toggle label="Alto contraste" sub="Cores mais fortes e bordas em tudo" on={p.contraste} onChange={(v) => save({ contraste: v })} />
          <Toggle label="Leitura automática" sub="Lê cada página em voz alta ao abrir. Os botões “Ouvir” já funcionam sempre." soon />
          <Toggle label="Reduzir animações" sub="Menos movimento na tela" on={p.movimento} onChange={(v) => save({ movimento: v })} />
          <p className="xs muted">Feito para funcionar com leitores de tela (NVDA, VoiceOver e TalkBack) e com o teclado.</p>
        </section>
        <section className="card" id="libras"><h2 className="ch"><Icon name="hand" />Audição</h2>
          <Toggle label="Libras (VLibras)" sub="Mostra o tradutor de Libras do governo federal em todas as páginas" on={p.libras} onChange={(v) => save({ libras: v })} />
          <Toggle label="Legendas sempre ligadas" sub="Em vídeos e áudios" soon />
          <Toggle label="Avisos visuais" sub="Pisca a tela e vibra em vez de tocar som" soon />
        </section>
      </div>
      <aside className="stack">
        {askAja}
        <FeedbackForm />
      </aside>
    </div>
  )
}
