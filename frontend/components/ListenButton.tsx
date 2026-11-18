'use client'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { speak } from '@/lib/speech'

// Lê um texto em voz alta com a voz do próprio aparelho (pt-BR).
export function ListenButton({ text, label = 'Ouvir', className = 'btn ghost sm', iconOnly = false }: { text: string; label?: string; className?: string; iconOnly?: boolean }) {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }, [])
  function toggle() {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    setSpeaking(true)
    speak(text, { onend: () => setSpeaking(false) })
  }
  return (
    <button type="button" className={className} onClick={toggle} aria-pressed={speaking} aria-label={iconOnly ? (speaking ? 'Parar leitura' : label) : undefined}>
      <Icon name={speaking ? 'stop' : 'sound'} />
      {iconOnly ? <span className="hide-m">{speaking ? 'Parar' : label}</span> : speaking ? 'Parar' : label}
    </button>
  )
}
