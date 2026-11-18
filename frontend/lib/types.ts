export type Place = { lat: number; lng: number; heading: number }
export type Bairro = { slug: string; name: string; district: string; lat: number; lng: number; pilot: boolean; abertos: number; conquistas: number }
export type Topic = {
  id: string; slug: string; title: string; category: string; categoryLabel: string; audiences: string[]
  address: string; neighborhood: string; neighborhoodSlug: string; location: Place | null; example: boolean; summary: string; proposal: string; photoDescription: string
  stage: number; stageLabel: string; stageNote: string
  supports: number; passes: number; mySupport: { passesBy: boolean } | null
  reports: number; evidences: number; libras: number; comments: number; refs: number
  rating: number; ratings: number; verifiedOk: number; verifiedNotOk: number
  protocol: { number: string; org: string; openedAt: string; openDays: number; status: string; next: string } | null
  dossier: { number: string; at: string; sentAt: string | null; version: number } | null
  conquest: { before: string; after: string; beforeDate: string; afterDate: string } | null
  concept: string | null
  createdAgo: string; updatedAgo: string
}
export type TopicDetail = Topic & {
  conceptAuthor: { id: string; name: string; profession: string } | null
  progresso: { pessoas: number; visual: number; local: boolean; metaPessoas: number; metaVisual: number; metaTopico: number }
  evidenceList: { id: string; format: string; body: string; caption: string; media: string | null; mediaType: string | null; passesBy: boolean; ago: string; place: Place | null; mapsUrl: string | null; mine: boolean }[]
}
export type Comment = { id: string; author: string; initials: string; badge: string | null; kind: string; body: string; mediaLabel: string | null; helpful: number; mineHelpful: boolean; ago: string; volunteerId: string | null; media: string | null }
export type Thread = Comment & { replies: Comment[]; lastReplyAgo: string | null }
export type Question = { id: number; context: string; question: string; answer: string }
export type User = { id: string; name: string; email: string; role: string; naoLidas?: number }
export type Notificacao = { id: string; kind: string; title: string; body: string | null; topic: string | null; href: string | null; actor: string | null; read: boolean; ago: string }
export type Prefs = { tema: 'claro' | 'escuro' | 'auto'; texto: number; contraste: boolean; movimento: boolean; libras: boolean; voz: boolean; legendas: boolean; avisos: boolean }

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
