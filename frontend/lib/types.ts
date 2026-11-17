export type Topic = {
  id: string; slug: string; title: string; category: string; categoryLabel: string; audiences: string[]
  address: string; neighborhood: string; summary: string; proposal: string; photoDescription: string
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
  evidenceList: { id: string; format: string; body: string; caption: string; media: string | null; mediaType: string | null; passesBy: boolean; ago: string }[]
}
export type Comment = { id: string; author: string; initials: string; badge: string | null; kind: string; body: string; mediaLabel: string | null; helpful: number; mineHelpful: boolean; ago: string }
export type Thread = Comment & { replies: Comment[]; lastReplyAgo: string | null }
export type Question = { id: number; context: string; question: string; answer: string }
export type User = { id: string; name: string; email: string; role: string }
export type Prefs = { tema: 'claro' | 'escuro' | 'auto'; texto: number; contraste: boolean; movimento: boolean; libras: boolean; voz: boolean; legendas: boolean; avisos: boolean }
