'use client'
import Script from 'next/script'
import { Icon } from './Icon'

type VLibrasWidget = { open?: () => void }

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

export function LibrasButton() {
  function open() {
    const widget = (window as unknown as { VLibrasWidget?: VLibrasWidget }).VLibrasWidget
    if (widget?.open) widget.open()
    else window.location.href = '/acessibilidade#libras'
  }
  return <button className="iconbtn" type="button" aria-label="Traduzir a página para Libras" onClick={open}><Icon name="hand" /></button>
}
