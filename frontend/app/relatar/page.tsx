import { api, getBairroSlug } from '@/lib/api'
import type { Bairro, Question, TopicDetail } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { Crumbs } from '@/components/Crumbs'
import { ReportForm } from '@/components/ReportForm'
import { Icon } from '@/components/Icon'
import { AskAja } from '@/components/AskAja'

export const metadata = { title: 'Relatar barreira' }

export default async function Relatar({ searchParams }: { searchParams: Promise<{ topico?: string; formato?: string }> }) {
  const sp = await searchParams
  const [perguntas, topic, bairros, bairro] = await Promise.all([
    api<Question[]>('/api/perguntas?contextos=relatar,privacidade'),
    sp.topico ? api<TopicDetail>(`/api/topicos/${encodeURIComponent(sp.topico)}`, { allow404: true }).catch(() => null) : Promise.resolve(null),
    api<Bairro[]>('/api/bairros'),
    getBairroSlug(),
  ])
  const t = topic && 'slug' in topic ? topic : null
  return (
    <>
      <MHead back={t ? `/topicos/${t.slug}` : '/'} title={t ? 'Adicionar evidência' : 'Relatar barreira'} />
      <main className="wrap" id="conteudo">
        {t && <Crumbs items={[['Início', '/'], [t.title, `/topicos/${t.slug}`], ['Adicionar evidência']]} />}
        <div className="grid">
          <ReportForm topic={t ? { slug: t.slug, title: t.title, category: t.category, address: t.address, neighborhoodSlug: t.neighborhoodSlug } : null} format={sp.formato} bairros={bairros.map((b) => ({ slug: b.slug, name: b.name }))} bairro={bairro} />
          <aside className="stack" aria-label="Depois do relato">
            <section className="card"><h2 className="ch"><Icon name="clock" />O que acontece depois</h2>
              <ol className="tl" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li className="it"><span className="rail"><span className="dot d" /><span className="ln" /></span><span className="bd"><b>Seu relato entra no mapa</b><span className="small muted">Na hora</span></span></li>
                <li className="it"><span className="rail"><span className="dot" /><span className="ln" /></span><span className="bd"><b>Entra num tópico</b><span className="small muted">Num tópico parecido que você escolher ou num tópico novo</span></span></li>
                <li className="it"><span className="rail"><span className="dot" /><span className="ln" /></span><span className="bd"><b>O tópico vira dossiê para a prefeitura</b><span className="small muted">Com protocolo no SP156</span></span></li>
                <li className="it"><span className="rail"><span className="dot" /></span><span className="bd"><b>Você acompanha cada resposta</b><span className="small muted">Por aviso no app, e-mail ou WhatsApp</span></span></li>
              </ol></section>
            <section className="card gsoft"><h2 className="ch" style={{ color: 'var(--green)' }}><Icon name="lock" />Sua privacidade</h2><p className="small">Seu nome e seu rosto não vão para o dossiê. No vídeo em Libras, você escolhe se fica público ou só a legenda.</p></section>
            <AskAja questions={perguntas} limit={5} />
          </aside>
        </div>
      </main>
    </>
  )
}
