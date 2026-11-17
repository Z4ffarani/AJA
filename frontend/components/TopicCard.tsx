import Link from 'next/link'
import type { Topic } from '@/lib/types'
import { Progress, Tags } from './Progress'
import { VoteBox, VotePill } from './SupportButton'

export function TopicCard({ t }: { t: Topic }) {
  const initial = { supports: t.supports, passes: t.passes, mine: t.mySupport }
  const tags = t.stage >= 6 ? [t.categoryLabel, 'Conquista'] : [t.categoryLabel, ...t.audiences]
  const meta = t.stage >= 6
    ? `Antes e depois disponíveis · avaliação ${t.rating.toLocaleString('pt-BR')} de 5`
    : `${t.reports} relatos · ${t.evidences} evidências${t.libras ? ` · ${t.libras} ${t.libras > 1 ? 'vídeos' : 'vídeo'} em Libras` : ''} · atualizado ${t.updatedAgo}`
  return (
    <article className="card">
      <div className="topic">
        <VoteBox slug={t.slug} initial={initial} />
        <div className="stack s8 grow">
          <Tags list={tags} />
          <h2 className="h3"><Link href={`/topicos/${t.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{t.title}</Link></h2>
          <p className="small muted">{meta} · {t.comments} comentários</p>
          <Progress stage={t.stage} note={t.stageNote} />
          <VotePill slug={t.slug} initial={initial} comments={t.comments} />
        </div>
      </div>
    </article>
  )
}
