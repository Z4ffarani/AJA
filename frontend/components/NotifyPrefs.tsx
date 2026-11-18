'use client'
import { Icon } from './Icon'
import { Toggle } from './Toggle'

export function NotifyPrefs() {
  return (
    <section className="card"><h2 className="ch"><Icon name="user" />Como você quer receber</h2>
      <Toggle label="Áudio" soon /><Toggle label="Vídeo em Libras" soon />
      <p className="xs muted">Hoje os avisos chegam em texto, na aba Notificações.</p>
    </section>
  )
}
