import Link from 'next/link'
import type { Topic } from '@/lib/types'
import { Icon } from './Icon'
import { Tags } from './Progress'

export function TopicHeader({ t, tab }: { t: Topic; tab: string }) {
  const tabs: [string, string, number | null][] = [
    ['Resumo', '', null], ['Evidências', '/evidencias', t.reports], ['Comentários', '/comentarios', t.comments],
    ['Proposta', '/proposta', null], ['Andamento', '/andamento', null],
  ]
  return (
    <>
      <div className="stack s8">
        <p className="small muted only-d"><Link href="/">Início</Link> › {t.categoryLabel}</p>
        <Tags list={[t.categoryLabel, ...t.audiences]} />
        <h1 className="h1">{t.title}</h1>
        <p className="row muted"><Icon name="pin" />{t.address} · {t.neighborhood}</p>
      </div>
      <nav className="tabs" aria-label="Seções do tópico">
        {tabs.map(([n, p, c]) => (
          <Link key={n} href={`/topicos/${t.slug}${p}`} className={n === tab ? 'on' : undefined} aria-current={n === tab ? 'page' : undefined}>
            {n}{c !== null && <span className="badge gray">{c}</span>}
          </Link>
        ))}
      </nav>
    </>
  )
}
