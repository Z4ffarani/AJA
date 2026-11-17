// Popula o banco com os dados de exemplo do piloto (só quando está vazio).
import { randomBytes } from 'node:crypto'
import { sql } from '../db.js'
import { hashPassword } from '../auth.js'
import { TOPICS, REPORTS, COMMENTS, REFS, VOLUNTEER } from './data.js'
import { QUESTIONS } from './questions.js'

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000)
const dateOnly = (d: number) => daysAgo(d).toISOString().slice(0, 10)

export async function seedIfEmpty() {
  // O repertório de perguntas é sempre atualizado com o código.
  await sql`delete from questions`
  let i = 0
  for (const q of QUESTIONS) {
    await sql`insert into questions (context, question, answer, sort) values (${q.context}, ${q.question}, ${q.answer}, ${i++})`
  }

  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from topics`
  if (count > 0) return

  // Conta de voluntária de exemplo, sem senha utilizável.
  const unusable = await hashPassword(randomBytes(32).toString('hex'))
  const [ana] = await sql<{ id: string }[]>`
    insert into users (name, email, password_hash, role, profession, bio, tags, verified, links)
    values (${VOLUNTEER.name}, ${VOLUNTEER.email}, ${unusable}, 'voluntario', ${VOLUNTEER.profession}, ${VOLUNTEER.bio},
            ${VOLUNTEER.tags}, true, ${sql.json(VOLUNTEER.links)})
    returning id`

  const ids: Record<string, string> = {}
  for (const t of TOPICS) {
    const [row] = await sql<{ id: string }[]>`
      insert into topics (slug, title, category, audiences, address, summary, proposal, photo_description, stage,
        protocol_number, protocol_org, protocol_opened_at, protocol_status, next_step,
        dossier_number, dossier_at, dossier_sent_at, dossier_version,
        before_description, after_description, before_date, after_date,
        concept_author, concept_description, seed_supports, seed_passes, created_at, updated_at)
      values (${t.slug}, ${t.title}, ${t.category}, ${t.audiences}, ${t.address}, ${t.summary}, ${t.proposal}, ${t.photo}, ${t.stage},
        ${t.protocol?.number ?? null}, ${t.protocol?.org ?? null}, ${t.protocol ? dateOnly(t.protocol.openedDaysAgo) : null},
        ${t.protocol?.status ?? null}, ${t.protocol?.next ?? null},
        ${t.dossier?.number ?? null}, ${t.dossier ? dateOnly(t.dossier.daysAgo) : null},
        ${t.dossier?.sentDaysAgo != null ? dateOnly(t.dossier.sentDaysAgo) : null}, ${t.dossier?.version ?? 0},
        ${t.conquest?.before ?? null}, ${t.conquest?.after ?? null}, ${t.conquest?.beforeDate ?? null}, ${t.conquest?.afterDate ?? null},
        ${t.concept ? ana.id : null}, ${t.concept ?? null}, ${t.supports}, ${t.passes},
        ${daysAgo(t.daysAgo)}, ${daysAgo(Math.min(t.daysAgo, 1))})
      returning id`
    ids[t.slug] = row.id

    // Linha do tempo coerente com a etapa.
    const tl: [number, string, string, string | null][] = [[t.daysAgo, 'Primeiro relato', 'Relato de uma pessoa que passa pelo local.', null]]
    if (t.stage >= 1) tl.push([Math.max(t.daysAgo - 3, 1), 'Tópico criado', 'Relatos parecidos foram reunidos.', null])
    if (t.stage >= 2 && t.dossier) tl.push([t.dossier.daysAgo, 'Dossiê gerado', `Dossiê ${t.dossier.number} com relatos, evidências e fundamentação.`, null])
    if (t.stage >= 3 && t.protocol) tl.push([t.protocol.openedDaysAgo, 'Protocolo aberto no SP156', 'O AJA abriu o pedido com o dossiê anexado.', null])
    if (t.slug === 'piso-tatil-av-cupece') tl.push([13, 'Prefeitura respondeu', '', 'Solicitação encaminhada para vistoria técnica. Prazo estimado de 60 dias.'])
    if (t.stage >= 4 && t.protocol) tl.push([Math.max(t.protocol.openedDaysAgo - 40, 2), 'Intervenção aprovada', 'A prefeitura aprovou a execução.', 'Serviço incluído na programação de manutenção.'])
    if (t.stage >= 6 && t.protocol) tl.push([Math.max(t.protocol.openedDaysAgo - 160, 20), 'Obra concluída e verificada', 'Moradores que passam pelo local confirmaram a melhoria.', null])
    for (const [d, title, body, quote] of tl) {
      await sql`insert into timeline (topic_id, happened_on, title, body, official_quote) values (${row.id}, ${dateOnly(d)}, ${title}, ${body}, ${quote})`
    }

    // Referências.
    const refs = [...(t.category === 'piso' || t.category === 'calcada' || t.category === 'obstaculo' ? REFS._piso : []), ...REFS._leis, ...(t.category === 'piso' || t.category === 'obstaculo' ? REFS._dados : [])]
    for (const r of refs) {
      await sql`insert into refs (topic_id, kind, title, source, url, why, checked_by, status)
        values (${row.id}, ${r.kind}, ${r.title}, ${r.source}, ${r.url ?? null}, ${r.why}, ${r.by}, ${r.status ?? 'conferida'})`
    }

    if (t.conquest) {
      for (const s of t.conquest.ratings) await sql`insert into ratings (topic_id, stars) values (${row.id}, ${s})`
      for (let k = 0; k < t.conquest.stillOk; k++) await sql`insert into verifications (topic_id, still_ok) values (${row.id}, true)`
      for (let k = 0; k < t.conquest.notOk; k++) await sql`insert into verifications (topic_id, still_ok) values (${row.id}, false)`
    }
  }

  await sql`insert into pendencies (topic_id, body, volunteers) values (${ids['piso-tatil-av-cupece']}, 'A subprefeitura pediu uma foto com a medida da distância entre o fim do piso e a faixa.', 3)`

  for (const r of REPORTS) {
    const t = TOPICS.find((x) => x.slug === r.topic)!
    await sql`insert into reports (topic_id, category, format, body, caption, address, passes_by, created_at)
      values (${ids[r.topic]}, ${t.category}, ${r.format}, ${r.body}, ${r.caption ?? ''}, ${t.address}, ${r.passes}, ${daysAgo(Math.max(t.daysAgo - 2, 0))})`
  }

  for (const [slug, list] of Object.entries(COMMENTS)) {
    for (const c of list) {
      const [parent] = await sql<{ id: string }[]>`
        insert into comments (topic_id, user_id, author_name, author_badge, kind, body, media_label, seed_helpful, created_at)
        values (${ids[slug]}, ${c.author === 'Ana L.' ? ana.id : null}, ${c.author}, ${c.badge ?? null}, ${c.kind ?? 'texto'}, ${c.body}, ${c.label ?? null}, ${c.helpful}, ${new Date(Date.now() - c.hoursAgo * 3600000)})
        returning id`
      for (const r of c.replies ?? []) {
        await sql`insert into comments (topic_id, user_id, author_name, author_badge, parent_id, kind, body, media_label, seed_helpful, created_at)
          values (${ids[slug]}, ${r.author === 'Ana L.' ? ana.id : null}, ${r.author}, ${r.badge ?? null}, ${parent.id}, ${r.kind ?? 'texto'}, ${r.body}, ${r.label ?? null}, ${r.helpful}, ${new Date(Date.now() - r.hoursAgo * 3600000)})`
      }
    }
  }

  const contribs: [string, string, string, string, number][] = [
    ['concept', 'piso-tatil-av-cupece', 'Proposta para o piso tátil da Av. Cupecê', 'Piso direcional até a faixa e piso de alerta nos dois lados.', 4],
    ['orientacao', 'piso-tatil-av-cupece', 'Conferiu as normas citadas no dossiê', 'NBR 16537 e NBR 9050 no tópico do piso tátil.', 7],
    ['conquista', 'rampa-escola-estadual', 'Rampa da escola estadual', 'Ajudou a especificar a rampa que foi executada.', 60],
    ['orientacao', 'raizes-calcada-rua-dos-ipes', 'Sugeriu canteiro maior para as árvores', 'Solução que preserva as raízes e nivela a calçada.', 3],
    ['conquista', 'poste-meio-da-calcada', 'Poste retirado da calçada', 'Indicou a recomposição do piso após a retirada.', 120],
  ]
  for (const [kind, slug, title, body, d] of contribs) {
    await sql`insert into contributions (user_id, topic_id, kind, title, body, happened_on) values (${ana.id}, ${ids[slug]}, ${kind}, ${title}, ${body}, ${dateOnly(d)})`
  }
}
