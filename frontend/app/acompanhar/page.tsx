import Link from 'next/link'
import { api } from '@/lib/api'
import type { Topic, User } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Progress } from '@/components/Progress'
import { LogoutButton } from '@/components/LogoutButton'
import { NotifyPrefs } from '@/components/NotifyPrefs'

type Data = { relatos: Topic[]; apoios: Topic[]; avisos: { title: string; topic: string; slug: string; ago: string }[]; pendencias: { body: string; slug: string }[] }

export const metadata = { title: 'Acompanhar' }

function Item({ t, badge }: { t: Topic; badge: [string, string] }) {
  return (
    <Link className="card" href={`/topicos/${t.slug}/andamento`} style={{ color: 'inherit', textDecoration: 'none' }}>
      <div className="row wrapr"><span className={`badge ${badge[1]}`}>{badge[0]}</span><span className="tag">{t.categoryLabel}</span></div>
      <b className="h4">{t.title}</b>
      <Progress stage={t.stage} note={t.stageNote} steps={false} />
    </Link>
  )
}

export default async function Acompanhar({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { usuario } = await api<{ usuario: User | null }>('/api/eu')
  if (!usuario) {
    return (
      <>
        <MHead />
        <main className="wrap" id="conteudo" style={{ maxWidth: 640 }}>
          <section className="card p28 stack">
            <h1 className="h1">Acompanhar</h1>
            <p className="muted">Entre na sua conta para ver os seus relatos, os tópicos que você apoia e os avisos da prefeitura.</p>
            <Link className="btn" href="/entrar?voltar=/acompanhar">Entrar ou criar conta</Link>
          </section>
        </main>
      </>
    )
  }
  const aba = (await searchParams).aba ?? 'relatos'
  const d = await api<Data>('/api/acompanhar')
  const list = aba === 'apoios' ? d.apoios : d.relatos
  const pend = new Set(d.pendencias.map((p) => p.slug))
  const tab = (k: string, label: string, n: number) => (
    <Link key={k} href={`/acompanhar?aba=${k}`} role="tab" aria-selected={aba === k} className={aba === k ? 'on' : undefined}
     >{label} · {n}</Link>
  )
  return (
    <>
      <MHead />
      <main className="wrap" id="conteudo">
        <div className="row sb wrapr">
          <div className="stack s4"><h1 className="h1">Acompanhar</h1><p className="muted big">Olá, {usuario.name.split(' ')[0]}. O AJA cobra a prefeitura por você.</p></div>
          <LogoutButton />
        </div>
        <div className="seg" role="tablist" aria-label="O que acompanhar" style={{ maxWidth: 560 }}>
          {tab('relatos', 'Meus relatos', d.relatos.length)}{tab('apoios', 'Apoio', d.apoios.length)}
        </div>
        <div className="grid">
          <div className="stack">
            {list.map((t) => <Item key={t.id} t={t} badge={pend.has(t.slug) ? ['Pendência: ajude a responder', 'amber'] : t.stage >= 6 ? ['Conquista', 'green'] : t.stage >= 3 ? ['Em andamento', 'blue'] : ['Reunindo evidências', 'gray']} />)}
            {!list.length && <div className="card empty"><p>{aba === 'apoios' ? 'Você ainda não apoia nenhum tópico.' : 'Você ainda não relatou nenhuma barreira.'}</p><Link className="btn sm" href={aba === 'apoios' ? '/' : '/relatar'} style={{ marginTop: 12 }}>{aba === 'apoios' ? 'Ver tópicos do bairro' : 'Relatar barreira'}</Link></div>}
          </div>
          <aside className="stack">
            <section className="card" id="avisos"><h2 className="ch"><Icon name="bell" />Avisos recentes</h2>
              {d.avisos.length ? d.avisos.slice(0, 6).map((a, i) => (
                <div key={i} className="stack s4">{i > 0 && <hr className="hr" />}<b className="small">{a.title}</b><Link className="small" href={`/topicos/${a.slug}`}>{a.topic}</Link><span className="xs muted">{a.ago}</span></div>
              )) : <p className="small muted">Nenhum aviso ainda. Quando a prefeitura responder a um tópico que você acompanha, ele aparece aqui.</p>}
            </section>
            <NotifyPrefs />
          </aside>
        </div>
      </main>
    </>
  )
}
