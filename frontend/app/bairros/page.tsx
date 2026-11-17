import Link from 'next/link'
import { api, getBairroSlug } from '@/lib/api'
import type { Bairro } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'

export const metadata = { title: 'Bairros' }

export default async function Bairros() {
  const [bairros, atual] = await Promise.all([api<Bairro[]>('/api/bairros'), getBairroSlug()])
  return (
    <>
      <MHead back="/" title="Bairros" />
      <main className="wrap" id="conteudo" style={{ maxWidth: 820 }}>
        <div className="stack s4">
          <h1 className="h1">Escolha o bairro</h1>
          <p className="muted big">Veja as barreiras de outro bairro, apoie e relate por lá também.</p>
        </div>
        <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {bairros.map((b) => (
            <li key={b.slug} className={`card${b.slug === atual ? ' soft' : ''}`}>
              <div className="row sb wrapr">
                <div className="stack s4">
                  <h2 className="h3">{b.name}</h2>
                  <p className="small muted">{b.district}</p>
                </div>
                <div className="row wrapr">
                  {b.pilot ? <span className="badge blue">Piloto</span> : <span className="badge gray">Exemplo</span>}
                  {b.slug === atual && <span className="badge green"><Icon name="check" size={16} />Bairro atual</span>}
                </div>
              </div>
              <p>{b.abertos} {b.abertos === 1 ? 'tópico aberto' : 'tópicos abertos'} · {b.conquistas} {b.conquistas === 1 ? 'conquista' : 'conquistas'}</p>
              {b.slug !== atual && <div><a className="btn sm" href={`/bairro/${b.slug}`}><Icon name="arrow" />Ver {b.name}</a></div>}
            </li>
          ))}
        </ul>
        <section className="card flat">
          <h2 className="ch"><Icon name="question" />Seu bairro não está na lista?</h2>
          <p>O AJA começou pelo Parque Doroteia. Você já pode relatar barreiras de outros bairros vizinhos; quando houver relatos suficientes, o bairro ganha a própria página.</p>
          <div><Link className="btn sec sm" href="/relatar"><Icon name="plus" />Relatar uma barreira</Link></div>
        </section>
      </main>
    </>
  )
}
