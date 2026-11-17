// Lê a localização (e a direção do Street View, se houver) de um link do Google Maps.
// Links curtos (maps.app.goo.gl) são seguidos só até o endereço final, sem baixar a página.

export type Place = { lat: number; lng: number; heading: number }

export function parseMapsUrl(url: string): Place | null {
  const u = decodeURIComponent(url)
  const ok = (lat: number, lng: number) => Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  // Marcador de lugar: !3d-23.70203!4d-46.64218
  const pin = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (pin && ok(Number(pin[1]), Number(pin[2]))) return { lat: Number(pin[1]), lng: Number(pin[2]), heading: 0 }
  // Street View: @-23.70203,-46.64218,3a,75y,90h,...
  const at = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,([^/?]*))?/)
  if (at) {
    const lat = Number(at[1]), lng = Number(at[2])
    const h = at[3]?.match(/(\d+(?:\.\d+)?)h/)
    if (ok(lat, lng)) return { lat, lng, heading: h ? Math.round(Number(h[1])) % 360 : 0 }
  }
  // ?q=-23.7,-46.6 · ?ll= · ?cbll= · ?query=
  const q = u.match(/[?&](?:q|ll|cbll|query|center|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
  if (q && ok(Number(q[1]), Number(q[2]))) return { lat: Number(q[1]), lng: Number(q[2]), heading: 0 }
  return null
}

const SHORT = /^https:\/\/(maps\.app\.goo\.gl|goo\.gl)\//i
const GOOGLE = /^https:\/\/((www|maps)\.)?google\.[a-z.]+\//i

export async function placeFromMapsLink(url: string): Promise<Place | null> {
  let current = url
  for (let hop = 0; hop < 3; hop++) {
    const found = parseMapsUrl(current)
    if (found) return found
    if (!SHORT.test(current)) return null
    try {
      const res = await fetch(current, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(4000) })
      const next = res.headers.get('location')
      res.body?.cancel().catch(() => {})
      if (!next || !(SHORT.test(next) || GOOGLE.test(next))) return null
      current = next
    } catch {
      return null
    }
  }
  return parseMapsUrl(current)
}
