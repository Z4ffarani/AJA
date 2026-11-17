import Link from 'next/link'
import type { Metadata } from 'next'
import { loadTopic } from '@/lib/topic'
import { plural } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { Progress } from '@/components/Progress'
import { TopicAction, TopicFoot } from '@/components/TopicAction'
import { MapEmbed, OpenInMaps, StreetView } from '@/components/Place'
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
  const quotes = t.evidenceList.filter((e) => e.format !== 'foto' && e.format !== 'mapa').slice(0, 2)
  const photo = t.evidenceList.find((e) => e.format === 'foto' && e.media && e.mediaType?.startsWith('image'))
  return (
    <>
      <MHead back="/" title="Tópico" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Resumo" />
        <div className="grid wide">
          <div className="stack">
            {t.example && <p className="notice"><Icon name="flag" size={16} /> <b>Tópico de exemplo do piloto.</b> A rua é real; a barreira, as pessoas e o protocolo são simulados.</p>}
            {photo ? (
              <figure className="media" style={{ minHeight: 300, margin: 0 }}>
                <img src={photo.media!} alt="" />
                <span className="seal"><Icon name="camera" size={16} />Foto enviada por morador(a)</span>
                <figcaption className="cap"><b>Descrição:</b> {photo.caption || t.photoDescription || 'Sem descrição ainda.'}</figcaption>
              </figure>
            ) : t.location ? (
              <figure className="stack s8" style={{ margin: 0 }}>
                <StreetView place={t.location} label={t.address} />
                <figcaption className="small"><b>Vista do local no Google Street View</b>, que pode ser anterior ao relato. {t.photoDescription}</figcaption>
              </figure>
            ) : (
              <p className="notice"><b>Descrição:</b> {t.photoDescription || 'Sem foto ainda.'}</p>
            )}
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
            {t.location && (
              <section className="card" aria-labelledby="onde-t">
                <h2 className="ch" id="onde-t"><Icon name="pin" />Onde fica</h2>
                <p>{t.address} · {t.neighborhood}, São Paulo</p>
                <MapEmbed place={t.location} label={t.address} />
                <div className="row wrapr"><OpenInMaps place={t.location} /><OpenInMaps place={t.location} street /></div>
              </section>
            )}
            {quotes.length > 0 && (
              <section className="card">
                <h2 className="ch"><Icon name="chat" />O que as pessoas relatam</h2>
                {quotes.map((q, i) => (
                  <div key={q.id} className="stack s8">
                    {i > 0 && <hr className="hr" />}
                    {<blockquote className="stack s4" style={{ margin: 0 }}><p>“{q.body}”</p><span className="small muted">{q.format === 'audio' ? 'Relato por áudio, transcrito' : 'Relato por texto'}{q.passesBy ? ' · passa por ali' : ''}</span></blockquote>}
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
          <aside className="stack" aria-label={t.stage >= 6 ? 'Avaliação e andamento' : 'Apoio e andamento'}>
            <TopicAction t={t} />
            <section className="card">
              <h2 className="ch"><Icon name="building" />Andamento</h2>
              <Progress stage={t.stage} steps={false} />
              <p className="small muted">{t.protocol ? `Protocolo SP156 aberto há ${t.protocol.openDays} dias · ${t.protocol.org}.` : t.stageNote + '.'}</p>
              <Link className="btn sec full sm" href={`/topicos/${t.slug}/andamento`}>Ver andamento completo</Link>
            </section>
            <section className="card">
              <h2 className="ch"><Icon name="download" />Dossiê</h2>
              <p className="small muted">{t.dossier ? `Gerado em ${t.dossier.at} com ${plural(t.evidences, 'evidência', 'evidências')} e ${plural(t.reports, 'relato', 'relatos')}, sem dados pessoais.` : `Será gerado quando o tópico reunir evidências suficientes. Já dá para ver a prévia.`}</p>
              <Link className="btn sec full sm" href={`/topicos/${t.slug}/dossie`}>Ver dossiê</Link>
            </section>
            <AskAja questions={perguntas} limit={4} />
          </aside>
        </div>
      </main>
      <TopicFoot t={t} />
    </>
  )
}
