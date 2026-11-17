'use client'
import { Icon } from './Icon'
import { Toggle } from './Toggle'

export function NotifyPrefs() {
  return (
    <section className="card"><h2 className="ch"><Icon name="user" />Como você quer receber</h2>
      <Toggle label="Texto" on /><Toggle label="Áudio" on /><Toggle label="Vídeo em Libras" />
      <p className="xs muted">Envio de avisos simulado no piloto.</p>
    </section>
  )
}
