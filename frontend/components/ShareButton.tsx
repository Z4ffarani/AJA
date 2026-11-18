'use client'
import { useState } from 'react'
import { Icon } from './Icon'

export function ShareButton({ title }: { title: string }) {
  const [msg, setMsg] = useState('')
  async function share() {
    const url = window.location.href.replace(/\/(comentarios|proposta|andamento|evidencias|dossie)$/, '')
    try {
      if (navigator.share) await navigator.share({ title, url })
      else { await navigator.clipboard.writeText(url); setMsg('Link copiado') ; setTimeout(() => setMsg(''), 2500) }
    } catch { /* cancelado */ }
  }
  return <button type="button" className="btn ghost sm" onClick={share}><Icon name="share" />{msg || 'Compartilhar'}<span className="sr" aria-live="polite">{msg}</span></button>
}
