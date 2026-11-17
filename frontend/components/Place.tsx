import type { Place } from '@/lib/types'
import { Icon } from './Icon'

const ll = (p: Place) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
export const mapsLink = (p: Place) => `https://www.google.com/maps/search/?api=1&query=${ll(p)}`
export const streetLink = (p: Place) => `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${ll(p)}&heading=${p.heading}`

// Mapa do Google embutido (sem chave). O endereço por extenso fica sempre ao lado, para quem não vê o mapa.
export function MapEmbed({ place, label, zoom = 17, height = 240 }: { place: Place; label: string; zoom?: number; height?: number }) {
  return (
    <div className="embed" style={{ height }}>
      <iframe title={`Mapa: ${label}`} src={`https://maps.google.com/maps?q=${ll(place)}&z=${zoom}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  )
}

// Vista do Street View: imagem real do local, que pode ser anterior ao relato.
export function StreetView({ place, label, height = 300 }: { place: Place; label: string; height?: number }) {
  return (
    <div className="embed" style={{ height }}>
      <iframe title={`Street View: ${label}`} src={`https://www.google.com/maps?layer=c&cbll=${ll(place)}&cbp=12,${place.heading},0,0,0&output=svembed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    </div>
  )
}

export function OpenInMaps({ place, street }: { place: Place; street?: boolean }) {
  return (
    <a className="btn ghost sm" href={street ? streetLink(place) : mapsLink(place)} target="_blank" rel="noopener noreferrer">
      <Icon name="pin" />{street ? 'Abrir no Street View' : 'Abrir no Google Maps'}<span className="sr"> (abre em nova aba)</span>
    </a>
  )
}
