'use client'
import { Icon } from './Icon'

export function LibrasButtonInline({ label = 'Ver em Libras' }: { label?: string }) {
  function open() {
    const btn = document.querySelector<HTMLElement>('[vw-access-button]')
    if (btn) btn.click()
    else window.location.href = '/acessibilidade#libras'
  }
  return <button type="button" className="btn ghost sm" onClick={open}><Icon name="hand" />{label}</button>
}
