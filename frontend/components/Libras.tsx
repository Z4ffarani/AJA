'use client'
import { useState } from 'react'
import Script from 'next/script'
import { Icon } from './Icon'

type VLibrasWidget = { open?: () => void; close?: () => void }

// Widget oficial do VLibras (governo federal), ligado nas preferências.
// A versão atual cria o próprio botão flutuante e expõe window.VLibrasWidget.open().
export function VLibras() {
  return (
    <Script
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      strategy="lazyOnload"
      onLoad={() => {
        const w = window as unknown as { VLibras?: { Widget: new (url: string) => unknown } }
        if (w.VLibras) new w.VLibras.Widget('https://vlibras.gov.br/app')
      }}
    />
  )
}

// Procura o botão de fechar do widget aberto (inclusive dentro do shadow DOM do VLibras).
function findCloseButton(): HTMLElement | null {
  const sel = 'button[aria-label*="echar" i], [title*="echar" i], [class*="close" i], [vp-close]'
  const roots: (Document | ShadowRoot)[] = [document]
  document.querySelectorAll('*').forEach((el) => { if (el.shadowRoot) roots.push(el.shadowRoot) })
  for (const root of roots) {
    for (const el of Array.from(root.querySelectorAll<HTMLElement>(sel))) {
      if (el.closest('.aja-shell, main, header, nav')) continue
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el
    }
  }
  return null
}

export function LibrasButton() {
  const [open, setOpen] = useState(false)
  function toggle() {
    const widget = (window as unknown as { VLibrasWidget?: VLibrasWidget }).VLibrasWidget
    if (!widget) { window.location.href = '/acessibilidade#libras'; return }
    const closeBtn = findCloseButton()
    if (open || closeBtn) {
      if (widget.close) widget.close()
      else closeBtn?.click()
      setOpen(false)
    } else {
      widget.open?.()
      setOpen(true)
    }
  }
  return <button className="iconbtn" type="button" aria-label={open ? 'Fechar o tradutor de Libras' : 'Abrir o tradutor de Libras'} aria-pressed={open} onClick={toggle}><Icon name="hand" /></button>
}
