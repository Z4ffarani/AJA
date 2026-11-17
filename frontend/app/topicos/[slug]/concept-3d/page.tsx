import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadTopic } from '@/lib/topic'
import { MHead } from '@/components/Shell'
import { TopicHeader } from '@/components/TopicHeader'
import { Icon } from '@/components/Icon'
import { ListenButton } from '@/components/ListenButton'
import { LibrasButtonInline } from '@/components/LibrasInline'
import { AskAja } from '@/components/AskAja'

export const metadata = { title: 'Concept 3D' }

export default async function Concept({ params }: { params: Promise<{ slug: string }> }) {
  const { t, perguntas } = await loadTopic((await params).slug, ['concept'])
  if (!t.concept) notFound()
  const cq = perguntas.filter((q) => q.context === 'concept' || q.context === 'piso')
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Concept 3D" />
      <main className="wrap" id="conteudo">
        <TopicHeader t={t} tab="Concept 3D" />
        <div className="grid wide">
          <div className="stack">
            <figure className="card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
              <img src="/concept-piso-tatil.svg" alt={`Ilustração em perspectiva da proposta. ${t.concept}`} style={{ width: '100%', display: 'block', aspectRatio: '1000/560', objectFit: 'cover' }} />
              <figcaption className="row wrapr" style={{ padding: '12px 16px' }}><span className="badge amber"><Icon name="alert" size={16} />Visualização conceitual</span><span className="small muted">Ajuda a explicar a ideia. Não é projeto executivo: a decisão técnica é da prefeitura.</span></figcaption>
            </figure>
            <div className="row wrapr">
              <ListenButton text={`Descrição da cena. ${t.concept}`} label="Ouvir descrição" />
              <LibrasButtonInline />
            </div>
            <section className="card"><h2 className="ch"><Icon name="eye" />Descrição da cena</h2><p>{t.concept}</p></section>
          </div>
          <aside className="stack">
            <section className="card"><h2 className="ch"><Icon name="layers" />Elementos</h2>
              <div className="row"><span style={{ width: 20, height: 20, borderRadius: 5, background: '#FFC72C', flex: 'none' }} /><span><b>Piso direcional</b><br /><span className="small muted">Guia o caminho até a faixa</span></span></div>
              <div className="row"><span style={{ width: 20, height: 20, borderRadius: 5, background: '#FFC72C', border: '3px dotted #9A5B00', flex: 'none' }} /><span><b>Piso de alerta</b><br /><span className="small muted">Avisa o início da travessia</span></span></div>
              <div className="row"><span style={{ width: 20, height: 20, borderRadius: 5, background: '#1D5BD8', flex: 'none' }} /><span><b>Botoeira sonora</b><br /><span className="small muted">Som de localização e de travessia</span></span></div>
              <div className="row"><span style={{ width: 20, height: 20, borderRadius: 5, background: '#F5B54A', flex: 'none' }} /><span><b>Contagem visual</b><br /><span className="small muted">Para quem não ouve o bip</span></span></div>
            </section>
            {t.conceptAuthor && (
              <section className="card"><h2 className="ch"><Icon name="user" />Autoria</h2>
                <div className="row"><span className="avatar" aria-hidden="true">{t.conceptAuthor.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span><span><b>{t.conceptAuthor.name}</b><br /><span className="small muted">{t.conceptAuthor.profession} · voluntária</span></span></div>
                <Link className="btn sec full sm" href={`/voluntarios/${t.conceptAuthor.id}`}>Ver perfil</Link></section>
            )}
            <section className="card flat"><h2 className="ch"><Icon name="cube" />Modelo tátil</h2><p className="small">Arquivo para impressão 3D da maquete, para quem prefere conhecer a proposta pelo toque.</p><p className="xs muted">Em preparação pela voluntária.</p></section>
            <AskAja questions={cq} limit={4} />
          </aside>
        </div>
      </main>
    </>
  )
}
