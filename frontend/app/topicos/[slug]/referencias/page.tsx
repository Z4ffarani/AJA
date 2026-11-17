import { loadTopic, supportState } from '@/lib/topic'
import { api } from '@/lib/api'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon, type IconName } from '@/components/Icon'
import { SupportCard } from '@/components/SupportButton'
import { RefSuggest } from '@/components/RefSuggest'

type Ref = { id: string; kind: string; title: string; source: string; url: string | null; why: string; checked_by: string; status: string }
const GROUPS: [string, string, IconName, string][] = [['dados', 'Dados públicos', 'chart', 'blue'], ['norma', 'Normas técnicas', 'ruler', 'green'], ['lei', 'Leis e documentos institucionais', 'building', 'amber'], ['estudo', 'Estudos e sugestões', 'grad', 'gray']]
const KIND: Record<string, string> = { dados: 'Dados abertos', norma: 'Norma', lei: 'Lei', estudo: 'Estudo' }

export const metadata = { title: 'Referências' }

export default async function Referencias({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = await loadTopic((await params).slug)
  const refs = await api<Ref[]>(`/api/topicos/${t.slug}/referencias`)
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Referências" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Referências" />
        <div className="grid wide">
          <div className="stack s24">
            <p className="muted">Cada tópico junta dados públicos, normas, documentos e estudos que fundamentam o pedido. O AJA sugere as fontes; moradores e voluntários conferem.</p>
            {GROUPS.map(([k, label, icon, color]) => {
              const list = refs.filter((r) => r.kind === k)
              if (!list.length && k !== 'estudo') return null
              return (
                <section key={k} className="stack">
                  <h2 className="h3 row"><Icon name={icon} />{label}</h2>
                  {list.length ? (
                    <div className={list.length > 1 ? 'cols2' : 'stack'}>
                      {list.map((r) => (
                        <article key={r.id} className="card">
                          <div className="row wrapr"><span className={`badge ${color}`}>{KIND[r.kind]}</span>{r.status === 'sugerida' && <span className="badge gray">Aguardando conferência</span>}</div>
                          <h3 className="h4">{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> : r.title}</h3>
                          <p className="small muted">{r.source}</p>
                          <p className="small"><b>Por que importa aqui:</b> {r.why}</p>
                          <p className="xs muted row"><Icon name="check" size={16} />{r.checked_by}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <article className="card flat"><p className="small muted">Nenhum estudo adicionado ainda. Profissionais voluntários podem anexar pesquisas sobre o tema.</p></article>
                  )}
                </section>
              )
            })}
          </div>
          <aside className="stack">
            <RefSuggest slug={t.slug} />
            <div className="only-d"><SupportCard slug={t.slug} initial={supportState(t)} /></div>
          </aside>
        </div>
      </main>
    </>
  )
}
