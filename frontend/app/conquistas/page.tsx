import Link from 'next/link'
import { api } from '@/lib/api'
import type { Question, Topic } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { Progress, Tags } from '@/components/Progress'
import { ConquestActions } from '@/components/ConquestActions'
import { AskAja } from '@/components/AskAja'

type Conquest = Topic & { quote: { body: string; kind: string } | null; months: number }

export const metadata = { title: 'Conquistas' }

export default async function Conquistas() {
  const [list, perguntas] = await Promise.all([api<Conquest[]>('/api/conquistas'), api<Question[]>('/api/perguntas?contextos=conquista')])
  const [top, ...rest] = list
  return (
    <>
      <MHead />
      <main className="wrap" id="conteudo">
        <div className="stack s4"><h1 className="h1">Conquistas do bairro</h1><p className="muted big">{list.length} barreiras removidas e verificadas por quem passa por ali</p></div>
        {top && (
          <article className="card p28 stack s24">
            <div className="row wrapr"><span className="badge green"><Icon name="check" size={16} />Conquista verificada</span><Tags list={[top.categoryLabel, ...top.audiences]} /></div>
            <h2 className="h2"><Link href={`/topicos/${top.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{top.title}</Link></h2>
            <div className="cols2">
              <div className="card flat stack s4"><span className="lbl">Como era · {top.conquest?.beforeDate}</span><p>{top.conquest?.before}</p></div>
              <div className="card flat stack s4 ba-after"><span className="lbl">Como ficou · {top.conquest?.afterDate}</span><p>{top.conquest?.after}</p></div>
            </div>
            <Progress stage={top.stage} note={top.stageNote} />
            <div className="cols3">
              <div className="card flat"><span className="lbl">Avaliação de quem passa ali</span><span className="row"><span className="num">{top.rating.toLocaleString('pt-BR')}</span><span className="stars" role="img" aria-label={`${top.rating.toLocaleString('pt-BR')} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" />)}</span></span><span className="xs muted">{top.ratings} avaliações</span></div>
              <div className="card flat"><span className="lbl">Do relato à obra</span><span className="num">{top.months} {top.months === 1 ? 'mês' : 'meses'}</span><span className="xs muted">protocolo finalizado</span></div>
              <div className="card flat"><span className="lbl">Apoios</span><span className="num">{top.supports}</span><span className="xs muted">{top.passes} passam por ali</span></div>
            </div>
            <ConquestActions slug={top.slug} ok={top.verifiedOk} notOk={top.verifiedNotOk} />
            {top.quote && <blockquote className="stack s4" style={{ margin: 0 }}><p>“{top.quote.body}”</p><span className="small muted">{top.quote.kind === 'audio' ? 'Comentário em áudio' : 'Comentário'}</span></blockquote>}
          </article>
        )}
        <div className="grid">
          <div className="stack">
            <h2 className="h3">Outras conquistas</h2>
            <div className="cols2">
              {rest.map((c) => (
                <Link key={c.id} className="card" href={`/topicos/${c.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <b>{c.title}</b>
                  <p className="small"><span className="muted">Como ficou · {c.conquest?.afterDate}:</span> {c.conquest?.after}</p>
                  <span className="row small wrapr"><span className="badge green">Verificada</span><span className="muted">{c.rating.toLocaleString('pt-BR')} · {c.ratings} avaliações</span></span>
                </Link>
              ))}
            </div>
            <p className="xs muted">Ruas reais; conquistas, números e datas simulados do piloto. As fotos de antes e depois entram quando houver obras de verdade.</p>
          </div>
          <aside className="stack"><AskAja questions={perguntas} /></aside>
        </div>
      </main>
    </>
  )
}
