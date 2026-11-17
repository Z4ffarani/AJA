import Link from 'next/link'
import { loadTopic, supportState } from '@/lib/topic'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon, type IconName } from '@/components/Icon'
import { SupportCard } from '@/components/SupportButton'
import { ListenButton } from '@/components/ListenButton'
import { AskAja } from '@/components/AskAja'

const FMT: Record<string, [IconName, string]> = { texto: ['file', 'Texto'], audio: ['mic', 'Áudio · transcrito'], foto: ['camera', 'Foto · com descrição'], libras: ['hand', 'Vídeo em Libras · legendado'] }

export const metadata = { title: 'Evidências' }

export default async function Evidencias({ params }: { params: Promise<{ slug: string }> }) {
  const { t, perguntas } = await loadTopic((await params).slug, ['relatar'])
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Evidências" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Evidências" />
        <div className="grid wide">
          <div className="stack">
            <div className="row sb wrapr"><h2 className="h3">{t.reports} relatos e evidências</h2><Link className="btn sm" href={`/relatar?topico=${t.slug}`}><Icon name="plus" />Adicionar evidência</Link></div>
            <div className="cols2">
              {t.evidenceList.map((e) => (
                <article key={e.id} className="card">
                  <div className="row wrapr"><span className="badge blue"><Icon name={FMT[e.format][0]} size={16} />{FMT[e.format][1]}</span>{e.passesBy && <span className="badge gray">Passa por ali</span>}<span className="small muted">{e.ago}</span></div>
                  {e.media && e.mediaType?.startsWith('image') && <img className="ev-media" src={e.media} alt={e.caption || 'Foto enviada como evidência'} />}
                  {e.media && e.mediaType?.startsWith('audio') && <audio className="ev-media" src={e.media} controls preload="none" />}
                  {e.media && e.mediaType?.startsWith('video') && <video className="ev-media" src={e.media} controls preload="none" />}
                  {!e.media && (e.format === 'foto' || e.format === 'libras') && <div className="media" style={{ minHeight: 140 }}><span className="seal"><Icon name={FMT[e.format][0]} size={16} />{e.format === 'foto' ? 'Foto' : 'Vídeo'}</span></div>}
                  {e.caption && <p className="small"><b>{e.format === 'foto' ? 'Descrição' : 'Legenda'}:</b> {e.caption}</p>}
                  {e.body && <p>{e.format === 'texto' ? e.body : `“${e.body}”`}</p>}
                  <div><ListenButton text={e.caption || e.body} className="btn ghost sm" /></div>
                </article>
              ))}
            </div>
          </div>
          <aside className="stack only-d">
            <SupportCard slug={t.slug} initial={supportState(t)} />
            <AskAja questions={perguntas} limit={4} />
          </aside>
        </div>
      </main>
    </>
  )
}
