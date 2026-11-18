import Link from 'next/link'
import { plural, type Topic } from '@/lib/types'
import { Progress, Tags } from './Progress'
import { VoteBox, VotePill } from './SupportButton'
import { Icon } from './Icon'

// Conquistas não pedem mais apoio: mostram a avaliação de quem passa pelo local.
function RatingBox({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="vote rated">
      <div className="box" role="img" aria-label={`Avaliação ${rating.toLocaleString('pt-BR')} de 5`}>
        <Icon name="star" className="ic" />
        <span className="n">{rating.toLocaleString('pt-BR')}</span>
        <span className="t">de 5</span>
      </div>
      <span className="aff">{plural(count, 'avaliação', 'avaliações')}</span>
    </div>
  )
}

export function TopicCard({ t }: { t: Topic }) {
  const initial = { supports: t.supports, passes: t.passes, mine: t.mySupport }
  const done = t.stage >= 6
  const tags = done ? [t.categoryLabel, 'Conquista'] : [t.categoryLabel, ...t.audiences]
  const meta = done
    ? `Antes e depois disponíveis · avaliação ${t.rating.toLocaleString('pt-BR')} de 5`
    : `${plural(t.reports, 'evidência', 'evidências')} · atualizado ${t.updatedAgo}`
  const href = `/topicos/${t.slug}`
  return (
    <article className="card" aria-labelledby={`t-${t.slug}`}>
      <div className="topic">
        {done ? <RatingBox rating={t.rating} count={t.ratings} /> : <VoteBox slug={t.slug} initial={initial} />}
        <div className="stack s8 grow">
          <Tags list={tags} />
          <h2 className="h3" id={`t-${t.slug}`}><Link href={href} className="tlink">{t.title}</Link></h2>
          <p className="small muted">{t.neighborhood && <><Icon name="pin" size={16} className="c-muted" /> {t.neighborhood} · </>}{meta}</p>
          <Progress stage={t.stage} note={t.stageNote} />
          {!done && <VotePill slug={t.slug} initial={initial} />}
          <div className="row wrapr card-foot">
            <Link className="btn sec sm" href={href}><Icon name="arrow" />Ver projeto<span className="sr">: {t.title}</span></Link>
            <Link className="btn sec sm" href={`${href}/comentarios`}><Icon name="chat" />{t.comments}<span className="sr"> comentários</span></Link>
          </div>
        </div>
      </div>
    </article>
  )
}
