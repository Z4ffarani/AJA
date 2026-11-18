// Como o AJA reconhece que dois relatos falam da mesma rua ou do mesmo ponto.
// No protótipo é uma regra simples; no produto, esse papel é dos agentes de IA.

const TYPES: Record<string, string> = {
  r: 'rua', rua: 'rua', av: 'avenida', ave: 'avenida', avenida: 'avenida', tv: 'travessa', trav: 'travessa', travessa: 'travessa',
  al: 'alameda', alameda: 'alameda', pc: 'praca', pca: 'praca', praca: 'praca', est: 'estrada', estr: 'estrada', estrada: 'estrada',
  rod: 'rodovia', rodovia: 'rodovia', lgo: 'largo', largo: 'largo', vl: 'viela', viela: 'viela',
}
const WORDS: Record<string, string> = {
  dr: 'doutor', dra: 'doutora', prof: 'professor', profa: 'professora', maj: 'major', cel: 'coronel', gal: 'general', gen: 'general',
  eng: 'engenheiro', pe: 'padre', sto: 'santo', sta: 'santa', cap: 'capitao', ten: 'tenente', sen: 'senador', dep: 'deputado', pres: 'presidente',
}
const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export type Street = { type: string | null; name: string }

// "R. Dr. Carlos de Rezende Enout, 120" → { type: 'rua', name: 'doutor carlos rezende enout' }
export function streetOf(address: string): Street | null {
  const raw = address.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (raw.startsWith('localizacao do aparelho')) return null
  const head = raw.split(/,| - | n[ºo°]\s*\d|\bperto\b|\bproximo\b|\besquina\b/)[0]
  const tokens = head.split(/[\s.]+/).filter(Boolean)
  if (!tokens.length) return null
  const type = TYPES[tokens[0]] ?? null
  const rest = (type ? tokens.slice(1) : tokens).map((t) => WORDS[t] ?? t).filter((t) => !STOP.has(t) && !/^\d+$/.test(t))
  return rest.length ? { type, name: rest.join(' ') } : null
}

export function sameStreet(a: Street | null, b: Street | null) {
  if (!a || !b) return false
  if (a.type && b.type && a.type !== b.type) return false
  return a.name === b.name
}

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Raio para juntar automaticamente (mesma categoria) e para sugerir tópicos parecidos.
export const AUTO_JOIN_M = 60
export const SUGGEST_M = 150
