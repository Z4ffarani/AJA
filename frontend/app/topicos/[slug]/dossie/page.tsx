import Link from 'next/link'
import { loadTopic } from '@/lib/topic'
import { MHead } from '@/components/Shell'
import { Icon } from '@/components/Icon'
import { ListenButton } from '@/components/ListenButton'
import { AskAja } from '@/components/AskAja'

const FMT: Record<string, string> = { texto: 'texto', audio: 'áudio', foto: 'foto', libras: 'Libras' }

export const metadata = { title: 'Dossiê' }

export default async function Dossie({ params }: { params: Promise<{ slug: string }> }) {
  const { t, perguntas } = await loadTopic((await params).slug, ['dossie'])
  const dq = perguntas.filter((q) => q.context === 'dossie')
  const counts = t.evidenceList.reduce<Record<string, number>>((a, e) => ({ ...a, [e.format]: (a[e.format] ?? 0) + 1 }), {})
  const resumo = Object.entries(counts).map(([f, n]) => `${n} em ${FMT[f]}`).join(', ')
  const pdf = `/api/topicos/${t.slug}/dossie.pdf`
  const texto = `Dossiê sobre ${t.title}. Local: ${t.address}, ${t.neighborhood}. Situação: ${t.summary} Quem é afetado: ${t.reports} evidências; ${t.passes} moradores passam pelo local e ${t.supports} apoiam a melhoria. Pedido: ${t.proposal}`
  return (
    <>
      <MHead back={`/topicos/${t.slug}`} title="Dossiê" />
      <main className="wrap" id="conteudo">
        <div className="stack s8">
          <p className="small muted only-d"><Link href="/">Início</Link> › <Link href={`/topicos/${t.slug}`}>{t.title}</Link> › Dossiê</p>
          <h1 className="h1">Dossiê da demanda</h1>
          <p className="muted">Documento que o AJA envia à prefeitura. Reúne evidências e fundamentos, sem dados pessoais.</p>
        </div>
        <div className="grid wide">
          <article className="doc" aria-label="Prévia do dossiê">
            <div className="row sb"><span className="logo" style={{ background: '#3F7DEF' }} role="img" aria-label="AJA" /><span className="xs muted">Dossiê nº {t.dossier?.number ?? 'em preparação'} · {t.dossier?.at ?? 'prévia'} · dados simulados</span></div>
            <h2 className="h2" style={{ color: '#0F172A' }}>{t.title}</h2>
            <p className="muted">{t.address} · {t.neighborhood} · Subprefeitura Cidade Ademar</p>
            <h3 className="h4">1. Situação</h3><p>{t.summary}</p>
            <h3 className="h4">2. Quem é afetado</h3><p>{t.reports} evidências{resumo ? ` (${resumo})` : ''}. {t.passes} moradores informaram que passam pelo local; {t.supports} apoiam a melhoria.</p>
            <h3 className="h4">3. Evidências</h3>
            <div className="cols3">{t.evidenceList.filter((e) => e.format === 'foto' || e.format === 'libras').slice(0, 3).map((e) => <div key={e.id} className="media" style={{ minHeight: 90 }}>{e.media && e.mediaType?.startsWith('image') && <img src={e.media} alt="" />}</div>)}</div>
            <p className="xs muted">{t.evidences} fotos, áudios e vídeos com descrição, anexos ao final.</p>
            <h3 className="h4">4. Fundamentação</h3><p>Normas técnicas de acessibilidade (ABNT NBR 16537 e NBR 9050), Lei Brasileira de Inclusão e dados do SP156.</p>
            <h3 className="h4">5. Pedido</h3><p>{t.proposal || 'Remoção da barreira e adequação às normas de acessibilidade.'}</p>
          </article>
          <aside className="stack">
            <section className="card"><h2 className="ch"><Icon name="download" />Baixar</h2>
              <a className="btn full only-d" href={pdf} download={`dossie-${t.slug}.pdf`}><Icon name="download" />Baixar PDF</a>
              <a className="btn sec full" href={pdf} target="_blank" rel="noopener"><Icon name="file" />Abrir PDF acessível</a>
              <ListenButton text={texto} label="Ouvir o dossiê" className="btn ghost full" />
            </section>
            <section className="card"><h2 className="ch"><Icon name="send" />Envio</h2>
              <div className="kv"><span className="muted">Para</span><b>{t.protocol?.org.split(' · ')[0] ?? 'Subprefeitura Cidade Ademar'}</b></div>
              <div className="kv"><span className="muted">Canal</span><b>SP156</b></div>
              <div className="kv"><span className="muted">Enviado em</span><b>{t.dossier?.sentAt ?? 'Ainda não enviado'}</b></div>
              <div className="kv"><span className="muted">Versão</span><b>{t.dossier?.version || 1}</b></div></section>
            <section className="card gsoft"><h2 className="ch" style={{ color: 'var(--green)' }}><Icon name="lock" />Sem dados pessoais</h2><p className="small">Nomes, rostos e telefones ficam fora. Quem relatou aparece como “Morador(a) A, B, C”.</p></section>
            <AskAja questions={dq} limit={4} />
          </aside>
        </div>
      </main>
      <div className="foot" role="region" aria-label="Baixar dossiê"><a className="btn full" href={pdf} download={`dossie-${t.slug}.pdf`}><Icon name="download" />Baixar PDF</a></div>
    </>
  )
}
