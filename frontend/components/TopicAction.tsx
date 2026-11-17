import type { TopicDetail } from '@/lib/types'
import { supportState } from '@/lib/topic'
import { SupportCard, SupportFoot } from './SupportButton'
import { ConquestActions } from './ConquestActions'
import { Icon } from './Icon'

// Tópico aberto: apoio. Conquista: o apoio já não importa; vale avaliar e verificar.
export function TopicAction({ t }: { t: TopicDetail }) {
  if (t.stage >= 6) {
    return (
      <>
        <section className="card gsoft" aria-labelledby="nota-t">
          <h2 className="ch" id="nota-t"><Icon name="star" />Avaliação</h2>
          <p className="row"><span className="num">{t.rating.toLocaleString('pt-BR')}</span><span className="muted">de 5 · {t.ratings} avaliações</span></p>
          <p className="small muted">{t.supports} pessoas apoiaram esta melhoria antes de ela sair do papel.</p>
        </section>
        <ConquestActions slug={t.slug} ok={t.verifiedOk} notOk={t.verifiedNotOk} />
      </>
    )
  }
  return <SupportCard slug={t.slug} initial={supportState(t)} />
}

export function TopicFoot({ t }: { t: TopicDetail }) {
  return t.stage >= 6 ? null : <SupportFoot slug={t.slug} initial={supportState(t)} />
}
