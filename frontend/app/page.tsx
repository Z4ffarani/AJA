import Link from 'next/link'
import { api, getBairroSlug } from '@/lib/api'
import type { Question, Topic } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { TopicCard } from '@/components/TopicCard'
import { Icon } from '@/components/Icon'
import { AskAja } from '@/components/AskAja'
import { NeighborhoodMap } from '@/components/NeighborhoodMap'

const FILTERS: [string, string][] = [['piso', 'Piso tátil'], ['travessia', 'Travessias'], ['sinalizacao', 'Sinalização'], ['comunicacao', 'Comunicação acessível'], ['calcada', 'Calçadas'], ['obstaculo', 'Obstáculos']]

export default async function Inicio({ searchParams }: { searchParams: Promise<{ ordem?: string; categoria?: string; busca?: string; ver?: string; foco?: string }> }) {
  const sp = await searchParams
  const ordem = sp.ordem === 'recentes' ? 'recentes' : 'alta'
  const slug = await getBairroSlug()
  const qs = new URLSearchParams({ ordem, bairro: slug, ...(sp.categoria ? { categoria: sp.categoria } : {}) })
  const [all, bairro, perguntas] = await Promise.all([
    api<Topic[]>(`/api/topicos?${qs}`),
    api<{ slug: string; name: string; district: string; lat: number; lng: number; pilot: boolean; abertos: number; protocolos: number; conquistas: number; participantes: number }>(`/api/bairro?slug=${slug}`),
    api<Question[]>('/api/perguntas?contextos=geral,apoio,prefeitura'),
  ])
  const busca = (sp.busca ?? '').trim().toLowerCase()
  const topics = busca ? all.filter((t) => `${t.title} ${t.address} ${t.categoryLabel}`.toLowerCase().includes(busca)) : all
  const href = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams()
    const merged = { ordem: sp.ordem, categoria: sp.categoria, ...p }
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, v))
    const s = q.toString()
    return s ? `/?${s}` : '/'
  }
  const mapa = sp.ver === 'mapa'
  const pins = all.filter((t) => t.location).map((t) => ({ slug: t.slug, title: t.title, address: t.address, lat: t.location!.lat, lng: t.location!.lng, done: t.stage >= 6 }))
  const mapLabel = `Mapa de ${bairro.name} com ${pins.length} barreiras. As mesmas barreiras estão na lista.`
  return (
    <>
      <MHead />
      <main className="wrap" id="conteudo">
        <div className="grid">
          <div className="stack">
            <div className="stack s4">
              <h1 className="h1">{bairro.name} · Acessibilidade</h1>
              <p className="row wrapr small"><span className="hood muted"><Icon name="pin" size={16} />{bairro.district}</span>{!bairro.pilot && <span className="badge gray">Bairro de exemplo</span>}<Link className="chip" href="/bairros"><Icon name="building" size={16} />Trocar bairro</Link></p>
              <p className="muted big">{bairro.abertos} tópicos abertos · {bairro.protocolos} protocolos em andamento · {bairro.conquistas} conquistas</p>
            </div>
            <form className="search only-m" role="search" action="/">
              <Icon name="search" />
              <label className="sr" htmlFor="busca-m">Buscar</label>
              <input id="busca-m" name="busca" type="search" defaultValue={sp.busca} autoFocus={sp.foco === 'busca'} placeholder="Buscar barreira, rua ou tema" style={{ border: 0, background: 'transparent', flex: 1, minWidth: 0, color: 'var(--ink)', font: 'inherit' }} />
            </form>
            <nav className="row wrapr" aria-label="Ordenar e filtrar">
              <Link className={`chip${ordem === 'alta' && !sp.categoria ? ' on' : ''}`} href={href({ ordem: undefined, categoria: undefined })} aria-current={ordem === 'alta' && !sp.categoria ? 'true' : undefined}>Em alta</Link>
              <Link className={`chip${ordem === 'recentes' ? ' on' : ''}`} href={href({ ordem: 'recentes' })} aria-current={ordem === 'recentes' ? 'true' : undefined}>Recentes</Link>
              {FILTERS.map(([k, t]) => (
                <Link key={k} className={`chip${sp.categoria === k ? ' on' : ''}`} href={href({ categoria: sp.categoria === k ? undefined : k })} aria-current={sp.categoria === k ? 'true' : undefined}>{t}</Link>
              ))}
            </nav>
            <div className="seg only-m" role="group" aria-label="Ver como">
              <Link href={href({ ver: undefined })} className={mapa ? undefined : 'on'}>Lista</Link>
              <Link href={href({ ver: 'mapa' })} className={mapa ? 'on' : undefined}>Mapa</Link>
            </div>
            {mapa && <div className="only-m"><NeighborhoodMap center={[bairro.lat, bairro.lng]} pins={pins} height={320} label={mapLabel} /></div>}
            {busca && <p className="notice">{topics.length} resultado{topics.length === 1 ? '' : 's'} para “{sp.busca}”. <Link href="/">Limpar busca</Link></p>}
            {topics.map((t) => <TopicCard key={t.id} t={t} />)}
            {!topics.length && <p className="card empty">Nenhum tópico encontrado. <Link href="/relatar">Relate uma barreira</Link>.</p>}
          </div>
          <aside className="stack only-d" aria-label="Bairro">
            <section className="card">
              <h2 className="ch"><Icon name="pin" />Mapa do bairro</h2>
              <NeighborhoodMap center={[bairro.lat, bairro.lng]} pins={pins} label={mapLabel} />
              <p className="xs muted">O mapa nunca é o único caminho: cada ponto também está na lista, com endereço por extenso. Azul: aberto · verde: conquista.</p>
            </section>
            <section className="card">
              <h2 className="ch"><Icon name="chart" />O bairro em números</h2>
              <div className="row"><span className="num c-primary">{bairro.abertos}</span><span className="muted">tópicos abertos</span></div>
              <div className="row"><span className="num c-primary">{bairro.participantes}</span><span className="muted">moradores participando</span></div>
              <div className="row"><span className="num c-primary">{bairro.conquistas}</span><span className="muted">conquistas verificadas</span></div>
              <p className="xs muted">Ruas reais; tópicos e números simulados do piloto.</p>
            </section>
            <section className="card soft">
              <h2 className="ch"><Icon name="plus" />Relate do seu jeito</h2>
              <p>Escreva, fale, fotografe ou grave em Libras. O AJA organiza o resto.</p>
              <div className="row wrapr"><span className="tag"><Icon name="file" size={16} />Texto</span><span className="tag"><Icon name="mic" size={16} />Áudio</span><span className="tag"><Icon name="camera" size={16} />Foto</span><span className="tag"><Icon name="hand" size={16} />Libras</span></div>
              <Link className="btn full" href="/relatar"><Icon name="plus" />Relatar barreira</Link>
            </section>
            <AskAja questions={perguntas} limit={5} />
          </aside>
        </div>
      </main>
    </>
  )
}
