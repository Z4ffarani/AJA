import { loadTopic, supportState } from '@/lib/topic'
import { api } from '@/lib/api'
import type { Thread, User } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { SupportCard } from '@/components/SupportButton'
import { Comments } from '@/components/Comments'

export const metadata = { title: 'Comentários' }

export default async function Comentarios({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = await loadTopic((await params).slug)
  const [threads, eu] = await Promise.all([
    api<Thread[]>(`/api/topicos/${t.slug}/comentarios`),
    api<{ usuario: User | null }>('/api/eu'),
  ])
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Comentários" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Comentários" />
        <div className="grid wide">
          <Comments slug={t.slug} initial={threads} logged={Boolean(eu.usuario)} />
          <aside className="stack only-d" aria-label="Sobre a conversa">
            <section className="card"><h2 className="ch"><Icon name="file" />Resumo da conversa</h2><p className="small">As pessoas concordam que a barreira precisa ser resolvida e trazem detalhes do dia a dia de quem passa pelo local. Sugestões de solução estão sendo conferidas por voluntários.</p><p className="xs muted">Feito pelo AJA. Pode conter erros.</p></section>
            <section className="card"><h2 className="ch"><Icon name="flag" />Combinados</h2><ul className="small stack s8" style={{ margin: 0, paddingLeft: 18 }}><li>Respeite quem relata: a experiência é dela.</li><li>Não publique rosto, nome ou endereço de outras pessoas.</li><li>Comente em texto, áudio ou Libras: todos valem igual.</li></ul></section>
            <SupportCard slug={t.slug} initial={supportState(t)} />
          </aside>
        </div>
      </main>
    </>
  )
}
