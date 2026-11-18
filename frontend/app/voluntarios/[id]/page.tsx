import Link from 'next/link'
import { api } from '@/lib/api'
import type { Question } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Crumbs } from '@/components/Crumbs'
import { Icon, type IconName } from '@/components/Icon'
import { AskAja } from '@/components/AskAja'

type V = { id: string; name: string; profession: string; bio: string; tags: string[]; verified: boolean; links: { label: string; url: string }[]
  counts: { orientacoes: number; concepts: number; conquistas: number; agradecimentos: number }
  contributions: { kind: string; title: string; body: string; ago: string; slug: string | null }[] }
const KIND: Record<string, [string, IconName, string, string]> = { concept: ['Concept 3D', 'cube', 'blue', '/proposta#concept'], orientacao: ['Orientação técnica', 'ruler', 'green', '/proposta'], conquista: ['Conquista', 'star', 'green', ''] }

export const metadata = { title: 'Perfil de voluntária' }

export default async function Voluntario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [v, perguntas] = await Promise.all([api<V>(`/api/voluntarios/${id}`), api<Question[]>('/api/perguntas?contextos=voluntario')])
  const initials = v.name.split(' ').map((p) => p[0]).join('').slice(0, 2)
  return (
    <>
      <MHead back="/" title="Perfil" />
      <main className="wrap" id="conteudo">
        <Crumbs items={[['Início', '/'], ['Voluntários'], [v.name]]} />
        <div className="grid">
          <div className="stack s24">
            <section className="card p28"><div className="row top wrapr" style={{ gap: 20 }}><span className="avatar lg" aria-hidden="true">{initials}</span>
              <div className="stack s8 grow"><h1 className="h1">{v.name}</h1><p className="big muted">{v.profession} · voluntária no Parque Doroteia</p>
                <div className="row wrapr">{v.verified && <span className="badge green"><Icon name="check" size={16} />Profissional verificada</span>}{v.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                <p>{v.bio}</p></div></div>
              <div className="cols4">
                <div className="card flat" style={{ padding: 14 }}><span className="num">{v.counts.orientacoes}</span><span className="small muted">orientações</span></div>
                <div className="card flat" style={{ padding: 14 }}><span className="num">{v.counts.concepts}</span><span className="small muted">estudos e concepts</span></div>
                <div className="card flat" style={{ padding: 14 }}><span className="num">{v.counts.conquistas}</span><span className="small muted">conquistas com sua ajuda</span></div>
                <div className="card flat" style={{ padding: 14 }}><span className="num">{v.counts.agradecimentos}</span><span className="small muted">agradecimentos</span></div>
              </div></section>
            <section className="stack"><h2 className="h3">Contribuições</h2>
              {v.contributions.map((c, i) => {
                const k = KIND[c.kind] ?? KIND.orientacao
                const inner = <><span className="row"><span className={`badge ${k[2]}`}><Icon name={k[1]} size={16} />{k[0]}</span><span className="small muted">{c.ago}</span></span>
                    <b>{c.title}</b><span className="small muted">{c.body}</span></>
                  return c.slug
                    ? <Link key={i} className="card" href={`/topicos/${c.slug}${k[3]}`} style={{ color: 'inherit', textDecoration: 'none' }}>{inner}</Link>
                    : <div key={i} className="card">{inner}</div>
              })}
            </section>
          </div>
          <aside className="stack">
            <section className="card"><h2 className="ch"><Icon name="link" />Contato externo</h2><p className="small">Para trabalhos profissionais, fale com a {v.name.split(' ')[0]} pelos canais dela. Contratações não acontecem dentro do AJA.</p>
              {v.links.filter((l) => !l.url.includes('example.com')).map((l) => <a key={l.url} className="btn sec full sm" href={l.url} target="_blank" rel="noopener noreferrer"><Icon name={l.url.startsWith('mailto') ? 'mail' : 'link'} />{l.label}<span className="sr"> (abre em nova aba)</span></a>)}
              {v.links.some((l) => l.url.includes('example.com')) && <p className="small muted">Perfil de exemplo do piloto. Aqui aparecem o site e o contato profissional que a pessoa voluntária quiser divulgar.</p>}
              <p className="xs muted">Links de exemplo no piloto.</p></section>
            <section className="card soft"><h2 className="ch"><Icon name="grad" />Seja voluntário</h2><p className="small">Arquitetura, engenharia, terapia ocupacional, Libras, direito: seu conhecimento ajuda a transformar relatos em propostas.</p><button className="btn full sm" type="button" disabled aria-disabled="true"><Icon name="grad" />Cadastro de voluntários · em breve</button></section>
            <AskAja questions={perguntas} />
          </aside>
        </div>
      </main>
    </>
  )
}
