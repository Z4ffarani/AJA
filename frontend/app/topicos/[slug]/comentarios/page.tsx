import { loadTopic } from '@/lib/topic'
import { api } from '@/lib/api'
import type { Thread, User } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { TopicAction } from '@/components/TopicAction'
import { Comments } from '@/components/Comments'

export const metadata = { title: 'Comentários' }

export default async function Comentarios({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = await loadTopic((await params).slug)
  const [threads, eu] = await Promise.all([
    api<Thread[]>(`/api/topicos/${t.slug}/comentarios`),
    api<{ usuario: User | null }>('/api/eu'),
  ])
  const all = threads.flatMap((c) => [c, ...c.replies])
  const total = all.length
  const people = new Set(all.map((c) => c.author)).size
  const passes = all.filter((c) => c.badge === 'Passa por ali').length
  const volunteers = all.filter((c) => c.volunteerId).length
  const audios = all.filter((c) => c.kind === 'audio').length
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Comentários" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Comentários" />
        <div className="grid wide">
          <Comments slug={t.slug} initial={threads} logged={Boolean(eu.usuario)} />
          <aside className="stack only-d" aria-label="Sobre a conversa">
            <section className="card"><h2 className="ch"><Icon name="file" />Quem está na conversa</h2>
              {total ? (
                <ul className="small stack s8" style={{ margin: 0, paddingLeft: 18 }}>
                  <li>{total} {total === 1 ? 'comentário' : 'comentários'} de {people} {people === 1 ? 'pessoa' : 'pessoas'}</li>
                  {passes > 0 && <li>{passes} {passes === 1 ? 'comentário' : 'comentários'} de quem passa por ali</li>}
                  {volunteers > 0 && <li>{volunteers} {volunteers === 1 ? 'resposta' : 'respostas'} de profissional voluntário</li>}
                  {audios > 0 && <li>{audios} {audios === 1 ? 'comentário' : 'comentários'} em áudio</li>}
                </ul>
              ) : <p className="small muted">Ninguém comentou ainda.</p>}
              <p className="xs muted">No produto, os agentes do AJA vão resumir a conversa aqui.</p></section>
            <section className="card"><h2 className="ch"><Icon name="flag" />Combinados</h2><ul className="small stack s8" style={{ margin: 0, paddingLeft: 18 }}><li>Respeite quem relata: a experiência é dela.</li><li>Não publique rosto, nome ou endereço de outras pessoas.</li><li>Comente em texto, áudio ou Libras: todos valem igual.</li></ul></section>
            <TopicAction t={t} />
          </aside>
        </div>
      </main>
    </>
  )
}
