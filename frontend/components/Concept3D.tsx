'use client'
import { useEffect, useRef, useState } from 'react'
import type { Mode, SceneApi } from '@/lib/conceptScene'
import { Icon } from './Icon'

const LEGEND: Record<Mode, [string, string, string][]> = {
  proposta: [
    ['1', 'Piso direcional', 'Segue junto ao muro e vira em direção à faixa.'],
    ['2', 'Piso de alerta', 'Na guia rebaixada, avisa onde começa a rua. Outro recebe quem chega do outro lado.'],
    ['3', 'Botoeira sonora', 'Som de localização e bip durante a travessia, com seta em relevo.'],
    ['4', 'Contagem visual', 'Mostra quanto tempo falta, para quem não ouve o bip.'],
  ],
  hoje: [
    ['!', 'O piso direcional termina', 'Para a cerca de 3 m da travessia, sem virar para a faixa.'],
    ['?', 'Sem piso de alerta', 'Nada avisa onde começa a rua. Também não há botoeira sonora nem contagem visual.'],
  ],
}

// Concept 3D interativo. A cena carrega só no navegador e só nesta página.
export function Concept3D({ fallback }: { fallback: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const api = useRef<SceneApi | null>(null)
  const [mode, setMode] = useState<Mode>('proposta')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    const el = box.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.querySelector('.aja.sem-movimento') !== null
    import('@/lib/conceptScene').then(({ createConceptScene }) => {
      if (!alive) return
      try {
        api.current = createConceptScene(el, { reducedMotion: reduced, onReady: () => alive && setState('ready') })
      } catch { setState('error') }
    }).catch(() => alive && setState('error'))
    return () => { alive = false; api.current?.dispose(); api.current = null }
  }, [])

  function choose(m: Mode) { setMode(m); api.current?.setMode(m) }
  function onKey(e: React.KeyboardEvent) {
    const a = api.current; if (!a) return
    const map: Record<string, () => void> = {
      ArrowLeft: () => a.rotate(-15), ArrowRight: () => a.rotate(15), ArrowUp: () => a.tilt(-8), ArrowDown: () => a.tilt(8),
      '+': () => a.zoom(0.8), '=': () => a.zoom(0.8), '-': () => a.zoom(1.25), Home: () => a.reset(),
    }
    if (map[e.key]) { e.preventDefault(); map[e.key]() }
  }

  if (state === 'error') return <>{fallback}</>
  return (
    <div className="stack s8">
      <div className="c3d-wrap">
        <div ref={box} className="c3d" tabIndex={0} role="group" onKeyDown={onKey}
          aria-label="Visualização 3D da esquina. Setas giram e inclinam a vista, mais e menos aproximam, Home volta à vista inicial. A descrição completa está logo abaixo." />
        {state === 'loading' && <p className="c3d-load small" role="status">Carregando a cena 3D…</p>}
        <div className="c3d-tools">
          <div className="seg" role="radiogroup" aria-label="Mostrar a esquina">
            <button type="button" role="radio" aria-checked={mode === 'hoje'} onClick={() => choose('hoje')}>Hoje</button>
            <button type="button" role="radio" aria-checked={mode === 'proposta'} onClick={() => choose('proposta')}>Proposta</button>
          </div>
          <span className="grow" />
          <button type="button" className="iconbtn" aria-label="Girar para a esquerda" onClick={() => api.current?.rotate(-20)}><Icon name="rotl" /></button>
          <button type="button" className="iconbtn" aria-label="Girar para a direita" onClick={() => api.current?.rotate(20)}><Icon name="rotate" /></button>
          <button type="button" className="iconbtn" aria-label="Aproximar" onClick={() => api.current?.zoom(0.75)}><Icon name="zoomin" /></button>
          <button type="button" className="iconbtn" aria-label="Afastar" onClick={() => api.current?.zoom(1.33)}><Icon name="zoomout" /></button>
          <button type="button" className="iconbtn" aria-label="Voltar à vista inicial" onClick={() => api.current?.reset()}><Icon name="recenter" /></button>
        </div>
      </div>
      <p className="xs muted">Arraste para girar · use a pinça ou a roda do mouse para aproximar.</p>
      <ul className="c3d-legend" aria-live="polite" aria-label={mode === 'hoje' ? 'Como está hoje' : 'O que a proposta inclui'}>
        {LEGEND[mode].map(([n, t, d]) => (
          <li key={n}><span className={`c3d-n${mode === 'hoje' ? ' bad' : ''}`} aria-hidden="true">{n}</span><span><b>{t}</b><br /><span className="small muted">{d}</span></span></li>
        ))}
      </ul>
    </div>
  )
}
