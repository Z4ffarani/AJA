import Link from 'next/link'
import { MHead } from '@/components/Shell'

export default function NotFound() {
  return (
    <>
      <MHead back="/" title="Não encontrado" />
      <main className="wrap" id="conteudo" style={{ maxWidth: 640 }}>
        <section className="card p28 stack">
          <h1 className="h1">Página não encontrada</h1>
          <p className="muted">O endereço pode ter mudado ou o tópico foi reunido com outro.</p>
          <Link className="btn" href="/">Voltar ao início</Link>
        </section>
      </main>
    </>
  )
}
