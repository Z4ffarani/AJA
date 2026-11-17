import 'server-only'
import { api } from './api'
import type { Question, TopicDetail } from './types'

const CTX: Record<string, string> = { piso: 'piso', travessia: 'travessia', comunicacao: 'libras', sinalizacao: 'libras', calcada: 'prefeitura', obstaculo: 'prefeitura', outro: 'prefeitura' }

export async function loadTopic(slug: string, extra: string[] = []) {
  const t = await api<TopicDetail>(`/api/topicos/${encodeURIComponent(slug)}`)
  const ctx = [CTX[t.category] ?? 'geral', ...extra].join(',')
  const perguntas = await api<Question[]>(`/api/perguntas?contextos=${ctx}`)
  return { t, perguntas }
}

export const supportState = (t: TopicDetail) => ({ supports: t.supports, passes: t.passes, mine: t.mySupport })
