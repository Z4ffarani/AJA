'use client'
import { Icon } from './Icon'
import { Toggle } from './Toggle'

export function NotifyPrefs() {
  return (
    <section className="card"><h2 className="ch"><Icon name="user" />Como você quer receber</h2>
      <Toggle label="E-mail" soon /><Toggle label="WhatsApp" soon /><Toggle label="Em áudio" soon /><Toggle label="Em vídeo em Libras" soon />
      <p className="xs muted">Hoje os avisos chegam em texto, na aba Notificações: reações ao que você publicou e avanços dos tópicos que você relatou.</p>
    </section>
  )
}
