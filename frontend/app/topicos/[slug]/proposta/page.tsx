import Link from 'next/link'
import { loadTopic } from '@/lib/topic'
import { api } from '@/lib/api'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon, type IconName } from '@/components/Icon'
import { ListenButton } from '@/components/ListenButton'
import { RefSuggest } from '@/components/RefSuggest'
import { AskAja } from '@/components/AskAja'

type Ref = { id: string; kind: string; title: string; source: string; url: string | null; why: string; checked_by: string; status: string; volunteer_id: string | null }
const GROUPS: [string, string, IconName, string][] = [['dados', 'Dados públicos', 'chart', 'blue'], ['norma', 'Normas técnicas', 'ruler', 'green'], ['lei', 'Leis e documentos institucionais', 'building', 'amber'], ['estudo', 'Estudos e sugestões', 'grad', 'gray']]
const KIND: Record<string, string> = { dados: 'Dados abertos', norma: 'Norma', lei: 'Lei', estudo: 'Estudo' }
const ELEMENTS: [string, string, React.CSSProperties][] = [
  ['Piso direcional', 'Guia o caminho até a faixa', { background: '#FFC72C' }],
  ['Piso de alerta', 'Avisa o início da travessia', { background: '#FFC72C', border: '3px dotted #9A5B00' }],
  ['Botoeira sonora', 'Som de localização e de travessia', { background: '#1D5BD8' }],
  ['Contagem visual', 'Para quem não ouve o bip', { background: '#F5B54A' }],
]

export const metadata = { title: 'Proposta' }

// Tudo sobre a solução num lugar: a melhoria proposta, o concept 3D (quando um voluntário fez) e as referências.
export default async function Proposta({ params }: { params: Promise<{ slug: string }> }) {
  const { t, perguntas } = await loadTopic((await params).slug, ['concept'])
  const refs = await api<Ref[]>(`/api/topicos/${t.slug}/referencias`)
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Proposta" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Proposta" />
        <div className="grid wide">
          <div className="stack s24">
            <section className="card soft">
              <h2 className="ch"><Icon name="piso" />Melhoria proposta</h2>
              <p>{t.proposal || 'A proposta é montada a partir dos relatos e das referências. A decisão técnica é da prefeitura.'}</p>
            </section>

            {t.concept && (
              <section className="stack" id="concept" aria-labelledby="concept-h">
                <h2 className="h3 row" id="concept-h"><Icon name="cube" />Concept 3D</h2>
                <figure className="card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
                  <img src="/concept-piso-tatil.svg" alt={`Ilustração em perspectiva da proposta. ${t.concept}`} style={{ width: '100%', display: 'block', aspectRatio: '1000/560', objectFit: 'cover' }} />
                  <figcaption className="row wrapr" style={{ padding: '12px 16px' }}><span className="badge amber"><Icon name="alert" size={16} />Visualização conceitual</span><span className="small muted">Ajuda a explicar a ideia. Não é projeto executivo: a decisão técnica é da prefeitura.</span></figcaption>
                </figure>
                <section className="card">
                  <h3 className="h4">Descrição da cena</h3>
                  <p>{t.concept}</p>
                  <div><ListenButton text={`Descrição da cena. ${t.concept}`} label="Ouvir descrição" /></div>
                  <h3 className="h4">Elementos</h3>
                  {ELEMENTS.map(([n, d, st]) => (
                    <div key={n} className="row"><span style={{ width: 20, height: 20, borderRadius: 5, flex: 'none', ...st }} /><span><b>{n}</b><br /><span className="small muted">{d}</span></span></div>
                  ))}
                </section>
              </section>
            )}

            <section className="stack s24" aria-labelledby="refs-h">
              <div className="stack s4">
                <h2 className="h3 row" id="refs-h"><Icon name="grad" />Referências</h2>
                <p className="muted">Dados públicos, normas, documentos e estudos que fundamentam o pedido. O AJA sugere as fontes; moradores e voluntários conferem.</p>
              </div>
              {GROUPS.map(([k, label, icon, color]) => {
                const list = refs.filter((r) => r.kind === k)
                if (!list.length && k !== 'estudo') return null
                return (
                  <section key={k} className="stack">
                    <h3 className="h4 row"><Icon name={icon} />{label}</h3>
                    {list.length ? (
                      <div className={list.length > 1 ? 'cols2' : 'stack'}>
                        {list.map((r) => (
                          <article key={r.id} className="card">
                            <div className="row wrapr"><span className={`badge ${color}`}>{KIND[r.kind]}</span>{r.status === 'sugerida' && <span className="badge gray">Aguardando conferência</span>}</div>
                            <h4 className="h4">{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> : r.title}</h4>
                            <p className="small muted">{r.source}</p>
                            <p className="small"><b>Por que importa aqui:</b> {r.why}</p>
                            <p className="xs muted row"><Icon name="check" size={16} />{r.volunteer_id ? <Link href={`/voluntarios/${r.volunteer_id}`}>{r.checked_by}</Link> : r.checked_by}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <article className="card flat"><p className="small muted">Nenhum estudo adicionado ainda. Profissionais voluntários podem anexar pesquisas sobre o tema.</p></article>
                    )}
                  </section>
                )
              })}
            </section>
          </div>
          <aside className="stack">
            {t.conceptAuthor && (
              <section className="card"><h2 className="ch"><Icon name="user" />Autoria do concept</h2>
                <div className="row"><span className="avatar" aria-hidden="true">{t.conceptAuthor.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span><span><b>{t.conceptAuthor.name}</b><br /><span className="small muted">{t.conceptAuthor.profession} · voluntária</span></span></div>
                <Link className="btn sec full sm" href={`/voluntarios/${t.conceptAuthor.id}`}>Ver perfil</Link></section>
            )}
            {t.concept && <section className="card flat"><h2 className="ch"><Icon name="cube" />Modelo tátil <span className="badge gray">Em breve</span></h2><p className="small">Arquivo para impressão 3D da maquete, para quem prefere conhecer a proposta pelo toque.</p></section>}
            <RefSuggest slug={t.slug} />
            <AskAja questions={perguntas} limit={4} />
          </aside>
        </div>
      </main>
    </>
  )
}
