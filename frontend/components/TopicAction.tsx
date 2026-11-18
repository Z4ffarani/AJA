import type { TopicDetail } from '@/lib/types'
import { supportState } from '@/lib/topic'
import { SupportCard, SupportFoot } from './SupportButton'
import { ConquestActions } from './ConquestActions'

// Tópico aberto: apoio. Conquista: o apoio já não importa; vale avaliar e verificar.
export function TopicAction({ t }: { t: TopicDetail }) {
  if (t.stage >= 6) {
    return <ConquestActions slug={t.slug} ok={t.verifiedOk} notOk={t.verifiedNotOk} rating={t.rating} ratings={t.ratings} supports={t.supports} />
  }
  return <SupportCard slug={t.slug} initial={supportState(t)} />
}

export function TopicFoot({ t }: { t: TopicDetail }) {
  return t.stage >= 6 ? null : <SupportFoot slug={t.slug} initial={supportState(t)} />
}
