import Link from 'next/link'
import { api } from '@/lib/api'
import type { Notificacao, Topic, User } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Progress } from '@/components/Progress'
import { LogoutButton } from '@/components/LogoutButton'
import { NotifyPrefs } from '@/components/NotifyPrefs'
import { Notifications } from '@/components/Notifications'

type Data = { relatos: Topic[]; apoios: Topic[]; pendencias: { body: string; slug: string }[] }

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

export default async function Acompanhar({ searchParams }: { searchParams: Promise<{ aba?: string; excluido?: string }> }) {
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
  const sp = await searchParams
  const aba = sp.aba === 'apoios' || sp.aba === 'notificacoes' ? sp.aba : 'relatos'
  const [d, notas] = await Promise.all([api<Data>('/api/acompanhar'), api<Notificacao[]>('/api/notificacoes')])
  const unread = notas.filter((n) => !n.read).length
  const list = aba === 'apoios' ? d.apoios : d.relatos
  const pend = new Set(d.pendencias.map((p) => p.slug))
  const tab = (k: string, label: string, n: number | null, badge = 0) => (
    <Link key={k} href={`/acompanhar?aba=${k}`} aria-current={aba === k ? 'page' : undefined} className={aba === k ? 'on' : undefined}>
      {label}{n !== null && ` · ${n}`}{badge > 0 && <span className="tabn" aria-label={`${badge} ${badge === 1 ? 'nova' : 'novas'}`}>{badge > 9 ? '9+' : badge}</span>}
    </Link>
  )
  return (
    <>
      <MHead />
      <main className="wrap" id="conteudo">
        <div className="row sb wrapr">
          <div className="stack s4"><h1 className="h1">Acompanhar</h1><p className="muted big">Olá, {usuario.name.split(' ')[0]}. O AJA cobra a prefeitura por você.</p></div>
          <LogoutButton />
        </div>
        <nav className="seg" aria-label="O que acompanhar" style={{ maxWidth: 640 }}>
          {tab('relatos', 'Meus relatos', d.relatos.length)}{tab('apoios', 'Apoios', d.apoios.length)}{tab('notificacoes', 'Notificações', null, unread)}
        </nav>
        {sp.excluido && <p className="notice" role="status">Evidência excluída. O tópico saiu junto, porque não tinha outras evidências nem participação de outras pessoas.</p>}
        <div className="grid">
          <div className="stack">
            {aba === 'notificacoes' && <Notifications items={notas} />}
            {aba !== 'notificacoes' && list.map((t) => <Item key={t.id} t={t} badge={pend.has(t.slug) ? ['Pendência: ajude a responder', 'amber'] : t.stage >= 6 ? ['Conquista', 'green'] : t.stage >= 3 ? ['Em andamento', 'blue'] : ['Reunindo evidências', 'gray']} />)}
            {aba !== 'notificacoes' && !list.length && <div className="card empty"><p>{aba === 'apoios' ? 'Você ainda não apoia nenhum tópico.' : 'Você ainda não relatou nenhuma barreira.'}</p><Link className="btn sm" href={aba === 'apoios' ? '/' : '/relatar'} style={{ marginTop: 12 }}>{aba === 'apoios' ? 'Ver tópicos do bairro' : 'Relatar barreira'}</Link></div>}
          </div>
          <aside className="stack">
            <NotifyPrefs />
          </aside>
        </div>
      </main>
    </>
  )
}
