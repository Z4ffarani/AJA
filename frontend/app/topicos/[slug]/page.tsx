import Link from 'next/link'
import type { Metadata } from 'next'
import { loadTopic, supportState } from '@/lib/topic'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { Progress } from '@/components/Progress'
import { SupportCard, SupportFoot } from '@/components/SupportButton'
import { ListenButton } from '@/components/ListenButton'
import { LibrasButtonInline } from '@/components/LibrasInline'
import { AskAja } from '@/components/AskAja'
import { ShareButton } from '@/components/ShareButton'

type P = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { t } = await loadTopic((await params).slug)
  return { title: t.title, description: t.summary }
}

export default async function Resumo({ params }: P) {
  const { t, perguntas } = await loadTopic((await params).slug, ['apoio'])
  const quotes = t.evidenceList.filter((e) => e.format !== 'foto').slice(0, 2)
  const photo = t.evidenceList.find((e) => e.format === 'foto')
  return (
    <>
      <MHead back="/" title="Tópico" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Resumo" />
        <div className="grid wide">
          <div className="stack">
            <figure className="media" style={{ minHeight: 300, margin: 0 }}>
              {photo?.media && photo.mediaType?.startsWith('image') && <img src={photo.media} alt="" />}
              <span className="seal"><Icon name="camera" size={16} />Foto {photo ? `1 de ${t.evidenceList.filter((e) => e.format === 'foto').length}` : 'ilustrativa'}</span>
              <figcaption className="cap"><b>Descrição:</b> {t.photoDescription || photo?.caption || 'Sem descrição ainda.'}</figcaption>
            </figure>
            <div className="row wrapr">
              <ListenButton text={`${t.title}. ${t.summary} Melhoria proposta: ${t.proposal}`} label="Ouvir resumo" />
              <LibrasButtonInline />
              <ShareButton title={t.title} />
            </div>
            <section className="card">
              <h2 className="ch"><Icon name="file" />Resumo da demanda</h2>
              <p>{t.summary}</p>
              <p className="xs muted">Resumo feito pelo AJA a partir de {t.reports} relatos e revisado por moradores.</p>
            </section>
            {quotes.length > 0 && (
              <section className="card">
                <h2 className="ch"><Icon name="chat" />O que as pessoas relatam</h2>
                {quotes.map((q, i) => (
                  <div key={q.id} className="stack s8">
                    {i > 0 && <hr className="hr" />}
                    {q.format === 'libras'
                      ? <div className="row top"><div className="media" style={{ width: 120, minHeight: 80, flex: 'none' }}><span className="seal"><Icon name="hand" size={16} /></span></div><div className="stack s4"><p>“{q.body}”</p><span className="small muted">Vídeo em Libras, legendado{q.passesBy ? ' · passa por ali' : ''}</span></div></div>
                      : <blockquote className="stack s4" style={{ margin: 0 }}><p>“{q.body}”</p><span className="small muted">{q.format === 'audio' ? 'Relato por áudio, transcrito' : 'Relato por texto'}{q.passesBy ? ' · passa por ali' : ''}</span></blockquote>}
                  </div>
                ))}
                <Link className="small" href={`/topicos/${t.slug}/evidencias`}>Ver todos os {t.reports} relatos</Link>
              </section>
            )}
            {t.proposal && (
              <section className="card soft">
                <h2 className="ch"><Icon name="piso" />Melhoria proposta</h2>
                <p>{t.proposal}</p>
                <p className="small">{t.concept && <><Link href={`/topicos/${t.slug}/concept-3d`}>Ver o concept 3D</Link> · </>}<Link href={`/topicos/${t.slug}/referencias`}>Ver as referências</Link></p>
              </section>
            )}
          </div>
          <aside className="stack" aria-label="Apoio e andamento">
            <SupportCard slug={t.slug} initial={supportState(t)} />
            <section className="card">
              <h2 className="ch"><Icon name="building" />Andamento</h2>
              <Progress stage={t.stage} steps={false} />
              <p className="small muted">{t.protocol ? `Protocolo SP156 aberto há ${t.protocol.openDays} dias · ${t.protocol.org}.` : t.stageNote + '.'}</p>
              <Link className="btn sec full sm" href={`/topicos/${t.slug}/andamento`}>Ver andamento completo</Link>
            </section>
            <section className="card">
              <h2 className="ch"><Icon name="download" />Dossiê</h2>
              <p className="small muted">{t.dossier ? `Gerado em ${t.dossier.at} com ${t.evidences} evidências e ${t.reports} relatos, sem dados pessoais.` : `Será gerado quando o tópico reunir evidências suficientes. Já dá para ver a prévia.`}</p>
              <Link className="btn sec full sm" href={`/topicos/${t.slug}/dossie`}>Ver dossiê</Link>
            </section>
            <AskAja questions={perguntas} limit={4} />
          </aside>
        </div>
      </main>
      <SupportFoot slug={t.slug} initial={supportState(t)} />
    </>
  )
}
