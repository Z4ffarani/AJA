'use client'
import { Icon } from './Icon'

export function LibrasButtonInline({ label = 'Ver em Libras' }: { label?: string }) {
  function open() {
    const widget = (window as unknown as { VLibrasWidget?: { open?: () => void } }).VLibrasWidget
    if (widget?.open) widget.open()
    else window.location.href = '/acessibilidade#libras'
  }
  return <button type="button" className="btn ghost sm" onClick={open}><Icon name="hand" />{label}</button>
}
