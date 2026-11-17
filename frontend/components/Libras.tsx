'use client'
import Script from 'next/script'
import { Icon } from './Icon'

// Widget oficial do VLibras (governo federal), ligado nas preferências.
export function VLibras() {
  return (
    <>
      {/* @ts-expect-error atributos próprios do VLibras */}
      <div vw="" className="enabled"><div vw-access-button="" className="active" /><div vw-plugin-wrapper=""><div className="vw-plugin-top-wrapper" /></div></div>
      <Script src="https://vlibras.gov.br/app/vlibras-plugin.js" strategy="lazyOnload" onLoad={() => { const w = window as any; if (w.VLibras) new w.VLibras.Widget('https://vlibras.gov.br/app') }} />
    </>
  )
}

export function LibrasButton() {
  function open() {
    const btn = document.querySelector<HTMLElement>('[vw-access-button]')
    if (btn) btn.click()
    else window.location.href = '/acessibilidade#libras'
  }
  return <button className="iconbtn" type="button" aria-label="Traduzir a página para Libras" onClick={open}><Icon name="hand" /></button>
}
