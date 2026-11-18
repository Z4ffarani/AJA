import Link from 'next/link'
import { loadTopic } from '@/lib/topic'
import { api } from '@/lib/api'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { Progress } from '@/components/Progress'
import { AskAja } from '@/components/AskAja'

type Andamento = { timeline: { date: string; title: string; body: string; quote: string | null }[]; pendencies: { id: string; body: string; volunteers: number }[] }

export const metadata = { title: 'Andamento com a prefeitura' }

export default async function AndamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, perguntas } = await loadTopic((await params).slug, ['prefeitura'])
  const a = await api<Andamento>(`/api/topicos/${t.slug}/andamento`)
  const pq = perguntas.filter((q) => q.context === 'prefeitura')
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Andamento" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Andamento" />
        <div className="grid wide">
          <div className="stack s24">
            <section className="card p28">
              {t.protocol ? (
                <div className="row wrapr sb">
                  <div className="stack s4"><span className="lbl">Protocolo SP156</span><span className="h2">{t.protocol.number}</span><span className="small muted">Número simulado · {t.protocol.org}</span></div>
                  <span className={`badge ${t.stage >= 6 ? 'green' : 'amber'}`}><Icon name="clock" size={16} />{t.protocol.status}</span>
                </div>
              ) : (
                <div className="stack s4"><span className="lbl">Ainda sem protocolo</span><span className="h3">{t.stageNote}</span><span className="small muted">O AJA abre o pedido no SP156 quando o dossiê fica pronto.</span></div>
              )}
              <Progress stage={t.stage} note={t.protocol ? `Aberto há ${t.protocol.openDays} dias` : ''} />
              <div className="cols3">
                <div className="card flat" style={{ padding: 14 }}><span className="lbl">Aberto há</span><span className="num">{t.protocol ? `${t.protocol.openDays} dias` : '—'}</span></div>
                <div className="card flat" style={{ padding: 14 }}><span className="lbl">Mediana do serviço</span><span className="num">266 dias</span><span className="xs muted">SP156, 2020–2026, obstáculo na calçada</span></div>
                <div className="card flat" style={{ padding: 14 }}><span className="lbl">Próximo passo</span><span className="h4">{t.protocol?.next ?? (t.stage < 2 ? 'Reunir evidências' : 'Enviar o dossiê')}</span></div>
              </div>
            </section>
            {a.pendencies.map((p) => (
              <section key={p.id} className="card asoft"><h2 className="ch" style={{ color: 'var(--amber)' }}><Icon name="alert" />Pendência</h2><p>{p.body}</p>
                <div className="row wrapr"><Link className="btn sm" href={`/relatar?topico=${t.slug}&formato=foto`}><Icon name="camera" />Enviar evidência</Link><span className="small muted">{p.volunteers} moradores se ofereceram</span></div></section>
            ))}
            <section className="card"><h2 className="ch"><Icon name="clock" />Linha do tempo</h2>
              <ol className="tl" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {a.timeline.map((it, i) => (
                  <li key={i} className="it">
                    <span className="rail"><span className={`dot ${i === 0 && t.stage < 6 ? 'c' : t.stage >= 6 ? 'g' : 'd'}`} />{i < a.timeline.length - 1 && <span className="ln" />}</span>
                    <span className="bd">
                      <span className="row wrapr"><b>{it.title}</b><span className="small muted">{it.date}</span></span>
                      {it.body && <span className="small muted">{it.body}</span>}
                      {it.quote && <blockquote className="card flat" style={{ margin: '4px 0 0', padding: 12 }}><p className="small">“{it.quote}”</p><span className="xs muted">Resposta oficial copiada do SP156</span></blockquote>}
                      {it.title === 'Dossiê gerado' && <Link className="small" href={`/topicos/${t.slug}/dossie`}>Ver dossiê</Link>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="stack">
            <section className="card flat"><h2 className="ch"><Icon name="link" />Como o AJA acompanha</h2><p className="small">O AJA consulta o protocolo no SP156 e avisa a cada mudança. Decisões, prazos e justificativas da prefeitura ficam públicos aqui.</p><p className="xs muted">No piloto, a consulta ao SP156 é simulada.</p></section>
            <AskAja questions={pq} limit={4} />
          </aside>
        </div>
      </main>
    </>
  )
}
