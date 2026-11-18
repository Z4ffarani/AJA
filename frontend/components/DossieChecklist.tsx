import type { TopicDetail } from '@/lib/types'
import { Icon } from './Icon'

// O que falta para o tópico virar dossiê (no protótipo, a regra que faz o papel dos agentes).
export function DossieChecklist({ t }: { t: TopicDetail }) {
  if (t.stage >= 2) return null
  const p = t.progresso
  const items: [boolean, string][] = [
    [p.pessoas >= p.metaPessoas, `${p.metaPessoas} pessoas relataram ou confirmaram · ${Math.min(p.pessoas, p.metaPessoas)} de ${p.metaPessoas}`],
    [p.visual >= p.metaVisual, 'Uma foto, vídeo ou link do Street View'],
    [p.local, 'O local marcado no mapa'],
  ]
  const done = items.filter((i) => i[0]).length
  return (
    <div className="stack s8">
      <p className="small"><b>Para virar dossiê</b> <span className="muted">· {done} de {items.length}</span></p>
      <ul className="checklist">
        {items.map(([ok, label]) => (
          <li key={label} className={ok ? 'ok' : undefined}><Icon name={ok ? 'check' : 'clock'} size={16} /><span>{label}<span className="sr">{ok ? ': feito' : ': falta'}</span></span></li>
        ))}
      </ul>
    </div>
  )
}
