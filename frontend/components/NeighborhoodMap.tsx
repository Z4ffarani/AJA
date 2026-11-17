'use client'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

type Pin = { slug: string; title: string; address: string; lat: number; lng: number; done: boolean }

// Mapa do bairro com as barreiras. É um complemento: a lista ao lado tem tudo por extenso.
export function NeighborhoodMap({ center, pins, height = 260, label }: { center: [number, number]; pins: Pin[]; height?: number; label: string }) {
  const el = useRef<HTMLDivElement>(null)
  const key = JSON.stringify([center, pins])
  useEffect(() => {
    let map: import('leaflet').Map | null = null
    let alive = true
    import('leaflet').then((L) => {
      if (!alive || !el.current) return
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView(center, 16)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map)
      const bounds: [number, number][] = []
      for (const p of pins) {
        const icon = L.divIcon({ className: '', html: `<span class="pin${p.done ? ' done' : ''}"></span>`, iconSize: [26, 26], iconAnchor: [13, 26] })
        const m = L.marker([p.lat, p.lng], { icon, title: p.title, alt: p.title, keyboard: true }).addTo(map)
        const a = document.createElement('a')
        a.href = `/topicos/${p.slug}`
        a.textContent = p.title
        const div = document.createElement('div')
        div.className = 'pin-pop'
        div.append(a, Object.assign(document.createElement('span'), { textContent: p.address }))
        m.bindPopup(div)
        bounds.push([p.lat, p.lng])
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 })
    })
    return () => { alive = false; map?.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return <div ref={el} className="nmap" style={{ height }} role="region" aria-label={label} />
}
