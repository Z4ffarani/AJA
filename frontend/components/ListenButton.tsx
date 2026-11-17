'use client'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

// Lê um texto em voz alta com a voz do próprio aparelho (pt-BR).
export function ListenButton({ text, label = 'Ouvir', className = 'btn ghost sm', iconOnly = false }: { text: string; label?: string; className?: string; iconOnly?: boolean }) {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }, [])
  function toggle() {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt'))
    if (voice) u.voice = voice
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }
  return (
    <button type="button" className={className} onClick={toggle} aria-pressed={speaking} aria-label={iconOnly ? (speaking ? 'Parar leitura' : label) : undefined}>
      <Icon name={speaking ? 'stop' : 'sound'} />
      {iconOnly ? <span className="hide-m">{speaking ? 'Parar' : label}</span> : speaking ? 'Parar' : label}
    </button>
  )
}
