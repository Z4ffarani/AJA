import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db.js'
import { checkPassword, currentUserId, hashPassword, requireUser, setSessionCookie, signSession, COOKIE } from '../auth.js'
import { allowedType, baseType, deleteFile, loadFile, saveFile } from '../storage.js'
import { placeFromMapsLink } from '../maps.js'
import { AUTO_JOIN_M, SUGGEST_M, distanceM, sameStreet, streetLabel, streetOf } from '../matching.js'
import { buildDossier } from '../pdf.js'

const STAGES = ['Relatado', 'Tópico', 'Dossiê', 'Protocolo', 'Em execução', 'Verificado']
const CATEGORY: Record<string, string> = {
  piso: 'Piso tátil', obstaculo: 'Obstáculo', travessia: 'Travessia', sinalizacao: 'Sinalização',
  comunicacao: 'Comunicação acessível', calcada: 'Calçada', outro: 'Outra barreira',
}
const AUDIENCE: Record<string, string> = { visual: 'Deficiência visual', auditiva: 'Deficiência auditiva' }

const days = (d: Date | string | null) => (d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0)
export function since(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'agora há pouco'
  if (h < 24) return `há ${h} h`
  const dd = Math.floor(h / 24)
  if (dd === 1) return 'ontem'
  if (dd < 30) return `há ${dd} dias`
  const m = Math.floor(dd / 30)
  return m === 1 ? 'há 1 mês' : `há ${m} meses`
}
const br = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null)

function stageNote(t: any) {
  switch (t.stage) {
    case 0: return 'Aguardando relatos de outras pessoas'
    case 1: return 'Reunindo evidências'
    case 2: return t.dossier_sent_at ? 'Dossiê enviado' : 'Dossiê pronto para envio'
    case 3: return `Protocolo SP156 aberto há ${days(t.protocol_opened_at)} dias`
    case 4: return t.next_step ?? 'Intervenção em andamento'
    case 5: return 'Aguardando verificação da comunidade'
    default: return `${t.verified_ok ?? 0} moradores verificaram`
  }
}

const topicSelect = (userId: string | null) => sql`
  select t.*,
    t.seed_supports + coalesce(s.n, 0) as supports,
    t.seed_passes + coalesce(s.p, 0) as passes,
    coalesce(r.n, 0) as reports, coalesce(r.ev, 0) as evidences, coalesce(r.libras, 0) as libras,
    coalesce(c.n, 0) as comments, coalesce(rf.n, 0) as refs,
    coalesce(rt.avg, 0) as rating, coalesce(rt.n, 0) as ratings,
    coalesce(v.ok, 0) as verified_ok, coalesce(v.notok, 0) as verified_not_ok,
    ${userId ? sql`(select passes_by from supports where topic_id = t.id and user_id = ${userId})` : sql`null`} as my_support
  from topics t
  left join (select topic_id, count(*)::int n, count(*) filter (where passes_by)::int p from supports group by topic_id) s on s.topic_id = t.id
  left join (select topic_id, count(*)::int n, count(*) filter (where format <> 'texto')::int ev, count(*) filter (where format = 'libras')::int libras from reports group by topic_id) r on r.topic_id = t.id
  left join (select topic_id, count(*)::int n from comments group by topic_id) c on c.topic_id = t.id
  left join (select topic_id, count(*)::int n from refs group by topic_id) rf on rf.topic_id = t.id
  left join (select topic_id, round(avg(stars)::numeric, 1)::float avg, count(*)::int n from ratings group by topic_id) rt on rt.topic_id = t.id
  left join (select topic_id, count(*) filter (where still_ok)::int ok, count(*) filter (where not still_ok)::int notok from verifications group by topic_id) v on v.topic_id = t.id`

function shape(t: any) {
  return {
    id: t.id, slug: t.slug, title: t.title, category: t.category, categoryLabel: CATEGORY[t.category] ?? t.category,
    audiences: (t.audiences as string[]).map((a) => AUDIENCE[a] ?? a),
    address: t.address, neighborhood: t.neighborhood, neighborhoodSlug: t.neighborhood_slug,
    location: t.lat != null ? { lat: t.lat, lng: t.lng, heading: t.heading ?? 0 } : null, example: Boolean(t.example),
    summary: t.summary, proposal: t.proposal, photoDescription: t.photo_description,
    stage: t.stage, stageLabel: t.stage >= 6 ? 'Verificado pela comunidade' : STAGES[t.stage], stageNote: stageNote(t),
    supports: t.supports, passes: t.passes, mySupport: t.my_support === null || t.my_support === undefined ? null : { passesBy: t.my_support },
    reports: t.reports, evidences: t.evidences, libras: t.libras, comments: t.comments, refs: t.refs,
    rating: t.rating, ratings: t.ratings, verifiedOk: t.verified_ok, verifiedNotOk: t.verified_not_ok,
    protocol: t.protocol_number ? { number: t.protocol_number, org: t.protocol_org, openedAt: br(t.protocol_opened_at), openDays: days(t.protocol_opened_at), status: t.protocol_status, next: t.next_step } : null,
    dossier: t.dossier_number ? { number: t.dossier_number, at: br(t.dossier_at), sentAt: br(t.dossier_sent_at), version: t.dossier_version } : null,
    conquest: t.before_description ? { before: t.before_description, after: t.after_description, beforeDate: t.before_date, afterDate: t.after_date } : null,
    concept: t.concept_description ?? null,
    createdAgo: since(t.created_at), updatedAgo: since(t.updated_at),
  }
}

async function findTopic(slug: string, userId: string | null) {
  const rows = await sql`${topicSelect(userId)} where t.slug = ${slug}`
  return rows[0] ?? null
}

async function threads(topicId: string, userId: string | null) {
  const rows = await sql`
    select c.*, u.role as author_role, c.seed_helpful + coalesce(h.n, 0) as helpful,
      ${userId ? sql`exists(select 1 from comment_helpful where comment_id = c.id and user_id = ${userId})` : sql`false`} as mine_helpful
    from comments c
    left join users u on u.id = c.user_id
    left join (select comment_id, count(*)::int n from comment_helpful group by comment_id) h on h.comment_id = c.id
    where c.topic_id = ${topicId}
    order by c.created_at`
  const map = (c: any) => ({
    id: c.id, author: c.author_name, initials: c.author_name.split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
    badge: c.author_badge, kind: c.kind, body: c.body, mediaLabel: c.media_label, helpful: c.helpful, mineHelpful: c.mine_helpful,
    ago: since(c.created_at), volunteerId: c.author_role === 'voluntario' ? c.user_id : null,
    media: c.media_key ? `/api/arquivos/${c.media_key}` : null,
  })
  const top = rows.filter((c: any) => !c.parent_id)
  return top
    .map((c: any) => {
      const replies = rows.filter((r: any) => r.parent_id === c.id).map(map)
      const last = replies.length ? rows.filter((r: any) => r.parent_id === c.id).at(-1)?.created_at : null
      return { ...map(c), replies, lastReplyAgo: last ? since(last) : null }
    })
    .sort((a: any, b: any) => b.helpful + b.replies.length * 3 - (a.helpful + a.replies.length * 3))
}

export async function apiRoutes(app: FastifyInstance) {
  // Notificações de reação: avisa as pessoas certas, nunca quem fez a ação, sem repetir a mesma reação.
  const reportersOf = async (topicId: string) =>
    (await sql`select distinct user_id from reports where topic_id = ${topicId} and user_id is not null`).map((r: any) => r.user_id as string)
  async function notify(to: (string | null | undefined)[], n: { actorId: string; topicId: string; kind: string; title: string; body?: string; link?: string }) {
    const [actor] = await sql`select name from users where id = ${n.actorId}`
    const seen = new Set<string>()
    for (const uid of to) {
      if (!uid || uid === n.actorId || seen.has(uid)) continue
      seen.add(uid)
      const dup = await sql`select 1 from notifications where user_id = ${uid} and actor_id = ${n.actorId} and topic_id = ${n.topicId} and kind = ${n.kind} and coalesce(body, '') = ${n.body ?? ''} limit 1`
      if (dup.length) continue
      await sql`insert into notifications (user_id, topic_id, kind, actor_id, actor_name, title, body, link)
        values (${uid}, ${n.topicId}, ${n.kind}, ${n.actorId}, ${actor?.name ?? null}, ${n.title}, ${n.body ?? null}, ${n.link ?? ''})`
    }
  }
  const snippet = (s: string) => (s.length > 140 ? s.slice(0, 137).trimEnd() + '…' : s)
  const firstName = (s: string) => s.trim().split(/\s+/)[0] ?? s

  // Quando um tópico avança sozinho (no protótipo, no lugar dos agentes):
  //   Relatado → Tópico: relatos de 2 pessoas diferentes
  //   Tópico → Dossiê: relatos de 3 pessoas, ao menos 1 evidência visual (foto, vídeo ou Street View) e o local no mapa
  // Daí em diante (protocolo, obra, verificação) depende da prefeitura e, no piloto, é simulado.
  const META = { topico: 2, pessoas: 3, visual: 1 }
  async function progress(topicId: string) {
    const [p] = await sql`select
      (select count(distinct coalesce(user_id::text, id::text))::int from reports where topic_id = ${topicId}) as pessoas,
      (select count(*)::int from reports where topic_id = ${topicId} and (format in ('foto', 'libras', 'mapa') or media_type like 'image/%' or media_type like 'video/%')) as visual,
      (select lat is not null from topics where id = ${topicId}) as local`
    return { pessoas: p.pessoas, visual: p.visual, local: Boolean(p.local), metaPessoas: META.pessoas, metaVisual: META.visual, metaTopico: META.topico }
  }
  async function advance(topicId: string, silent = false) {
    const [t] = await sql`select stage, example, dossier_number, title from topics where id = ${topicId}`
    if (!t || t.example || t.stage > 2) return
    const p = await progress(topicId)
    const target = p.pessoas >= META.pessoas && p.visual >= META.visual && p.local ? 2 : p.pessoas >= META.topico ? 1 : 0
    if (target === t.stage) return
    await sql`update topics set stage = ${target} where id = ${topicId}`
    if (target === 2 && !t.dossier_number) {
      const [n] = await sql`select count(*)::int + 100 as n from topics where dossier_number is not null`
      await sql`update topics set dossier_number = ${'AJA-' + String(n.n).padStart(4, '0')}, dossier_at = current_date, dossier_version = 1 where id = ${topicId}`
    }
    if (target > t.stage && !silent) {
      const msg = target === 2 ? ['Dossiê pronto', 'O tópico reuniu relatos de 3 pessoas, evidência visual e o local no mapa. O dossiê está pronto para envio.']
        : ['Tópico confirmado', 'Outra pessoa relatou a mesma barreira.']
      await sql`insert into timeline (topic_id, happened_on, title, body) values (${topicId}, current_date, ${msg[0]}, ${msg[1]})`
      for (const uid of await reportersOf(topicId))
        await sql`insert into notifications (user_id, topic_id, kind, title, link) values (${uid}, ${topicId}, 'aviso', ${target === 2 ? 'O tópico que você relatou ganhou o dossiê' : 'Outra pessoa confirmou a barreira que você relatou'}, ${target === 2 ? '/dossie' : '/evidencias'})`
    }
  }

  // Ao iniciar, recalcula a etapa dos tópicos criados por relatos (sem avisar ninguém).
  app.addHook('onReady', async () => {
    const rows = await sql`select id from topics where not example and stage <= 2`
    for (const r of rows) await advance(r.id, true)
  })

  app.get('/health', async () => ({ status: 'ok' }))

  // ── Conta ───────────────────────────────────────────────
  const Register = z.object({ name: z.string().trim().min(2).max(60), email: z.string().trim().toLowerCase().email().max(120), password: z.string().min(8).max(200) })
  app.post('/api/auth/cadastro', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const parsed = Register.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ erro: 'Confira nome, e-mail e senha (mínimo de 8 caracteres).' })
    const { name, email, password } = parsed.data
    const exists = await sql`select 1 from users where email = ${email}`
    if (exists.length) return reply.code(409).send({ erro: 'Já existe uma conta com este e-mail.' })
    const [u] = await sql`insert into users (name, email, password_hash) values (${name}, ${email}, ${await hashPassword(password)}) returning id, name, email, role`
    const token = await signSession(u.id)
    setSessionCookie(reply, token)
    return { usuario: u }
  })

  const Login = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) })
  app.post('/api/auth/entrar', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const parsed = Login.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ erro: 'Informe e-mail e senha.' })
    const [u] = await sql`select id, name, email, role, password_hash from users where email = ${parsed.data.email}`
    if (!u || !(await checkPassword(parsed.data.password, u.password_hash))) return reply.code(401).send({ erro: 'E-mail ou senha incorretos.' })
    const token = await signSession(u.id)
    setSessionCookie(reply, token)
    return { usuario: { id: u.id, name: u.name, email: u.email, role: u.role } }
  })

  app.post('/api/auth/sair', async (_req, reply) => {
    reply.clearCookie(COOKIE, { path: '/' })
    return { ok: true }
  })

  app.get('/api/eu', async (req) => {
    const id = await currentUserId(req)
    if (!id) return { usuario: null }
    const [u] = await sql`select id, name, email, role from users where id = ${id}`
    if (!u) return { usuario: null }
    const [c] = await sql`select count(*)::int as n from notifications where user_id = ${id} and read_at is null`
    return { usuario: { ...u, naoLidas: c.n } }
  })

  // ── Bairro ──────────────────────────────────────────────
  const hoodBySlug = async (slug?: string) => {
    const rows = await sql`select * from neighborhoods where slug = ${slug ?? 'parque-doroteia'}`
    return rows[0] ?? (await sql`select * from neighborhoods where pilot order by sort limit 1`)[0]
  }
  app.get('/api/bairros', async () => sql`
    select b.slug, b.name, b.district, b.lat, b.lng, b.pilot,
      count(t.id) filter (where t.stage < 6)::int as abertos, count(t.id) filter (where t.stage = 6)::int as conquistas
    from neighborhoods b left join topics t on t.neighborhood_slug = b.slug
    group by b.slug order by b.sort`)
  app.get('/api/bairro', async (req) => {
    const b = await hoodBySlug((req.query as { slug?: string }).slug)
    const [s] = await sql`select
      count(*) filter (where stage < 6)::int as abertos,
      count(*) filter (where stage between 3 and 5)::int as protocolos,
      count(*) filter (where stage = 6)::int as conquistas,
      coalesce(sum(seed_supports), 0)::int as apoios
      from topics where neighborhood_slug = ${b.slug}`
    const [p] = await sql`select count(distinct coalesce(r.user_id::text, r.id::text))::int as n from reports r join topics t on t.id = r.topic_id where t.neighborhood_slug = ${b.slug}`
    const base = b.pilot ? 280 : 40
    const { apoios, ...rest } = s
    return { slug: b.slug, name: b.name, district: b.district, lat: b.lat, lng: b.lng, pilot: b.pilot, ...rest, participantes: base + p.n + Math.round(apoios / 40) }
  })

  app.get('/api/topicos', async (req) => {
    const q = req.query as { ordem?: string; categoria?: string; bairro?: string }
    const userId = await currentUserId(req)
    const order = q.ordem === 'recentes' ? sql`order by t.created_at desc` : sql`order by (t.stage = 6), (t.seed_supports + coalesce(s.n, 0)) desc`
    const cat = q.categoria && q.categoria in CATEGORY ? sql`and t.category = ${q.categoria}` : sql``
    const hood = q.bairro && q.bairro !== 'todos' ? sql`and t.neighborhood_slug = ${q.bairro}` : sql``
    const rows = await sql`${topicSelect(userId)} where true ${cat} ${hood} ${order}`
    return rows.map(shape)
  })

  app.get('/api/topicos/:slug', async (req, reply) => {
    const userId = await currentUserId(req)
    const t = await findTopic((req.params as any).slug, userId)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const reports = await sql`select id, user_id, format, body, caption, media_key, media_type, passes_by, lat, lng, heading, maps_url, created_at from reports where topic_id = ${t.id} order by created_at desc`
    const author = t.concept_author ? (await sql`select id, name, profession from users where id = ${t.concept_author}`)[0] : null
    return {
      ...shape(t),
      progresso: await progress(t.id),
      conceptAuthor: author,
      evidenceList: reports.map((r: any) => ({ id: r.id, format: r.format, body: r.body, caption: r.caption, media: r.media_key ? `/api/arquivos/${r.media_key}` : null, mediaType: r.media_type, passesBy: r.passes_by, ago: since(r.created_at),
        place: r.lat != null ? { lat: r.lat, lng: r.lng, heading: r.heading ?? 0 } : null, mapsUrl: r.maps_url, mine: Boolean(userId && r.user_id === userId) })),
    }
  })

  // Apoio (um único voto, com "passo por ali" opcional).
  const Support = z.object({ passesBy: z.boolean().default(false) })
  app.put('/api/topicos/:slug/apoio', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const t = await findTopic((req.params as any).slug, userId)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const { passesBy } = Support.parse(req.body ?? {})
    const before = await sql`select passes_by from supports where topic_id = ${t.id} and user_id = ${userId}`
    await sql`insert into supports (topic_id, user_id, passes_by) values (${t.id}, ${userId}, ${passesBy})
      on conflict (topic_id, user_id) do update set passes_by = excluded.passes_by`
    if (!before.length) {
      const [me] = await sql`select name from users where id = ${userId}`
      await notify(await reportersOf(t.id), { actorId: userId, topicId: t.id, kind: 'apoio', title: `${firstName(me.name)} apoiou o seu relato`, body: passesBy ? 'E marcou que passa por essa barreira.' : undefined })
    }
    return shape(await findTopic(t.slug, userId))
  })
  app.delete('/api/topicos/:slug/apoio', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const t = await findTopic((req.params as any).slug, userId)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    await sql`delete from supports where topic_id = ${t.id} and user_id = ${userId}`
    return shape(await findTopic(t.slug, userId))
  })

  // Comentários em conversas.
  app.get('/api/topicos/:slug/comentarios', async (req, reply) => {
    const userId = await currentUserId(req)
    const t = await findTopic((req.params as any).slug, null)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    return threads(t.id, userId)
  })
  const NewComment = z.object({ body: z.string().trim().min(1).max(2000), parentId: z.string().uuid().optional() })
  async function notifyComment(topicId: string, actorId: string, actorName: string, parentId: string | undefined, body: string) {
    const name = firstName(actorName)
    if (parentId) {
      const [p] = await sql`select user_id from comments where id = ${parentId}`
      await notify([p?.user_id], { actorId, topicId, kind: 'resposta', title: `${name} respondeu o seu comentário`, body, link: '/comentarios' })
    }
    await notify(await reportersOf(topicId), { actorId, topicId, kind: 'comentario', title: `${name} comentou no seu relato`, body, link: '/comentarios' })
  }

  app.post('/api/topicos/:slug/comentarios', { config: { rateLimit: { max: 20, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const parsed = NewComment.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ erro: 'Escreva um comentário de até 2.000 caracteres.' })
    const t = await findTopic((req.params as any).slug, userId)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const [u] = await sql`select name, role, profession from users where id = ${userId}`
    const passes = await sql`select passes_by from supports where topic_id = ${t.id} and user_id = ${userId}`
    const badge = u.role === 'voluntario' ? `${u.profession ?? 'Profissional'} voluntária` : passes[0]?.passes_by ? 'Passa por ali' : null
    if (parsed.data.parentId) {
      const p = await sql`select 1 from comments where id = ${parsed.data.parentId} and topic_id = ${t.id} and parent_id is null`
      if (!p.length) return reply.code(400).send({ erro: 'Conversa não encontrada.' })
    }
    await sql`insert into comments (topic_id, user_id, author_name, author_badge, parent_id, body)
      values (${t.id}, ${userId}, ${u.name}, ${badge}, ${parsed.data.parentId ?? null}, ${parsed.data.body})`
    await notifyComment(t.id, userId, u.name, parsed.data.parentId, snippet(parsed.data.body))
    return threads(t.id, userId)
  })
  // Comentário em áudio (gravado no navegador), com transcrição opcional.
  app.post('/api/topicos/:slug/comentarios/audio', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const t = await findTopic((req.params as any).slug, userId)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const fields: Record<string, string> = {}
    let file: { buffer: Buffer; type: string } | null = null
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        if (!allowedType(part.mimetype) || !baseType(part.mimetype).startsWith('audio/')) return reply.code(400).send({ erro: 'Envie um arquivo de áudio.' })
        file = { buffer: await part.toBuffer(), type: baseType(part.mimetype) }
      } else fields[part.fieldname] = String(part.value ?? '')
    }
    if (!file || file.buffer.length < 200) return reply.code(400).send({ erro: 'O áudio ficou vazio. Tente gravar de novo.' })
    const F = z.object({ body: z.string().trim().max(2000).default(''), duration: z.string().regex(/^\d{1,2}:\d{2}$/).optional(), parentId: z.string().uuid().optional() })
    const parsed = F.safeParse(fields)
    if (!parsed.success) return reply.code(400).send({ erro: 'Não foi possível enviar o áudio.' })
    if (parsed.data.parentId) {
      const p = await sql`select 1 from comments where id = ${parsed.data.parentId} and topic_id = ${t.id} and parent_id is null`
      if (!p.length) return reply.code(400).send({ erro: 'Conversa não encontrada.' })
    }
    const [u] = await sql`select name, role, profession from users where id = ${userId}`
    const passes = await sql`select passes_by from supports where topic_id = ${t.id} and user_id = ${userId}`
    const badge = u.role === 'voluntario' ? `${u.profession ?? 'Profissional'} voluntária` : passes[0]?.passes_by ? 'Passa por ali' : null
    const key = await saveFile(file.buffer, file.type)
    await sql`insert into comments (topic_id, user_id, author_name, author_badge, parent_id, kind, body, media_label, media_key, media_type)
      values (${t.id}, ${userId}, ${u.name}, ${badge}, ${parsed.data.parentId ?? null}, 'audio', ${parsed.data.body}, ${parsed.data.duration ?? null}, ${key}, ${file.type})`
    await notifyComment(t.id, userId, u.name, parsed.data.parentId, parsed.data.body ? snippet(parsed.data.body) : 'Comentário em áudio')
    return threads(t.id, userId)
  })

  app.put('/api/comentarios/:id/util', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const id = z.string().uuid().safeParse((req.params as any).id)
    if (!id.success) return reply.code(400).send({ erro: 'Comentário inválido.' })
    const had = await sql`delete from comment_helpful where comment_id = ${id.data} and user_id = ${userId} returning 1`
    if (!had.length) {
      await sql`insert into comment_helpful (comment_id, user_id) values (${id.data}, ${userId}) on conflict do nothing`
      const [c] = await sql`select user_id, topic_id, body, kind from comments where id = ${id.data}`
      const [me] = await sql`select name from users where id = ${userId}`
      if (c) await notify([c.user_id], { actorId: userId, topicId: c.topic_id, kind: 'util', title: `${firstName(me.name)} achou o seu comentário útil`, body: c.body ? snippet(c.body) : 'Comentário em áudio', link: '/comentarios' })
    }
    const [c] = await sql`select c.seed_helpful + (select count(*)::int from comment_helpful where comment_id = c.id) as helpful from comments c where c.id = ${id.data}`
    return { helpful: c?.helpful ?? 0, mine: !had.length }
  })

  // Referências.
  app.get('/api/topicos/:slug/referencias', async (req, reply) => {
    const t = await findTopic((req.params as any).slug, null)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    return sql`select r.id, r.kind, r.title, r.source, r.url, r.why, r.checked_by, r.status, u.id as volunteer_id
      from refs r left join users u on u.id = r.checker_id and u.role = 'voluntario'
      where r.topic_id = ${t.id} order by r.status, r.created_at`
  })
  const NewRef = z.object({ text: z.string().trim().min(4).max(500) })
  app.post('/api/topicos/:slug/referencias', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const parsed = NewRef.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ erro: 'Informe o link ou o nome do documento.' })
    const t = await findTopic((req.params as any).slug, null)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const isUrl = /^https?:\/\//i.test(parsed.data.text)
    await sql`insert into refs (topic_id, kind, title, source, url, why, checked_by, status)
      values (${t.id}, 'estudo', ${isUrl ? 'Referência sugerida por morador(a)' : parsed.data.text}, 'Sugestão da comunidade', ${isUrl ? parsed.data.text : null}, 'aguardando conferência de um voluntário.', 'Sugerida pela comunidade', 'sugerida')`
    return { ok: true }
  })

  // Andamento com a prefeitura.
  app.get('/api/topicos/:slug/andamento', async (req, reply) => {
    const t = await findTopic((req.params as any).slug, null)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const tl = await sql`select happened_on, title, body, official_quote from timeline where topic_id = ${t.id} order by happened_on desc`
    const pend = await sql`select id, body, volunteers from pendencies where topic_id = ${t.id} and open`
    return { timeline: tl.map((x: any) => ({ date: br(x.happened_on)?.slice(0, 5), title: x.title, body: x.body, quote: x.official_quote })), pendencies: pend }
  })

  // Conquistas: avaliação e verificação contínua.
  app.post('/api/topicos/:slug/verificacao', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const { stillOk } = z.object({ stillOk: z.boolean() }).parse(req.body)
    const t = await findTopic((req.params as any).slug, userId)
    if (!t || t.stage < 5) return reply.code(404).send({ erro: 'Conquista não encontrada.' })
    await sql`delete from verifications where topic_id = ${t.id} and user_id = ${userId}`
    await sql`insert into verifications (topic_id, user_id, still_ok) values (${t.id}, ${userId}, ${stillOk})`
    return shape(await findTopic(t.slug, userId))
  })
  app.post('/api/topicos/:slug/avaliacao', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const { stars } = z.object({ stars: z.number().int().min(1).max(5) }).parse(req.body)
    const t = await findTopic((req.params as any).slug, userId)
    if (!t || t.stage < 5) return reply.code(404).send({ erro: 'Conquista não encontrada.' })
    await sql`delete from ratings where topic_id = ${t.id} and user_id = ${userId}`
    await sql`insert into ratings (topic_id, user_id, stars) values (${t.id}, ${userId}, ${stars})`
    // Avaliar já é verificar: quem avalia passou por ali e viu a melhoria funcionando.
    await sql`delete from verifications where topic_id = ${t.id} and user_id = ${userId}`
    await sql`insert into verifications (topic_id, user_id, still_ok) values (${t.id}, ${userId}, true)`
    return shape(await findTopic(t.slug, userId))
  })

  // Dossiê em PDF (texto real, legível por leitor de tela).
  app.get('/api/topicos/:slug/dossie.pdf', async (req, reply) => {
    const t = await findTopic((req.params as any).slug, null)
    if (!t) return reply.code(404).send({ erro: 'Tópico não encontrado.' })
    const reports = await sql`select format, body, caption, passes_by from reports where topic_id = ${t.id} order by created_at`
    const refs = await sql`select title, source from refs where topic_id = ${t.id} and status = 'conferida'`
    const pdf = await buildDossier(shape(t), reports as any, refs as any)
    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `inline; filename="dossie-${t.slug}.pdf"`)
    return reply.send(pdf)
  })

  // Relatar barreira (com arquivo opcional).
  app.post('/api/relatos', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const userId = await currentUserId(req)
    const fields: Record<string, string> = {}
    let file: { buffer: Buffer; type: string } | null = null
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        if (!allowedType(part.mimetype)) return reply.code(400).send({ erro: 'Formato de arquivo não aceito. Envie foto, áudio ou vídeo.' })
        file = { buffer: await part.toBuffer(), type: baseType(part.mimetype) }
      } else fields[part.fieldname] = String(part.value ?? '')
    }
    const Report = z.object({
      category: z.enum(['piso', 'obstaculo', 'travessia', 'sinalizacao', 'comunicacao', 'calcada', 'outro']),
      format: z.enum(['texto', 'audio', 'foto', 'libras', 'mapa']),
      body: z.string().trim().max(4000).default(''),
      caption: z.string().trim().max(1000).default(''),
      address: z.string().trim().min(3).max(200),
      neighborhood: z.string().trim().max(60).default('parque-doroteia'),
      mapsUrl: z.string().trim().max(600).default(''),
      lat: z.coerce.number().min(-90).max(90).optional(),
      lng: z.coerce.number().min(-180).max(180).optional(),
      passesBy: z.enum(['true', 'false']).default('false'),
      topic: z.string().trim().max(120).optional(),
    })
    const parsed = Report.safeParse(fields)
    if (!parsed.success) return reply.code(400).send({ erro: 'Diga o que é a barreira e onde fica.' })
    const r = parsed.data
    const hood = await hoodBySlug(r.neighborhood)

    // Link do Google Maps vira evidência com a vista do local (Street View).
    let place: { lat: number; lng: number; heading: number } | null = null
    if (r.mapsUrl) {
      if (!/^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(r.mapsUrl)) return reply.code(400).send({ erro: 'Cole um link do Google Maps.' })
      place = await placeFromMapsLink(r.mapsUrl)
      if (!place) return reply.code(400).send({ erro: 'Não achamos a localização nesse link. Abra o lugar no Google Maps e copie o link de novo.' })
    } else if (r.lat != null && r.lng != null) place = { lat: r.lat, lng: r.lng, heading: 0 }
    if (!r.body && !file && !r.mapsUrl) return reply.code(400).send({ erro: 'Conte a barreira por texto, áudio, foto, vídeo ou link do Google Maps.' })
    const mediaKey = file ? await saveFile(file.buffer, file.type) : null
    const format = file ? r.format : r.mapsUrl ? 'mapa' : r.format === 'mapa' ? 'texto' : r.format

    // Evidência para um tópico escolhido pela pessoa; senão, junta a um tópico aberto da mesma categoria
    // na mesma rua (abreviações igualadas) ou a menos de 60 m; senão, cria um tópico novo.
    let near: { id: string; slug: string }[] = []
    if (r.topic) {
      near = await sql`select id, slug from topics where slug = ${r.topic}`
      if (!near.length) return reply.code(400).send({ erro: 'Esse tópico não existe mais. Envie como relato novo.' })
    } else {
      const mine = streetOf(r.address)
      const open = await sql`select id, slug, address, lat, lng from topics where category = ${r.category} and stage < 6 and neighborhood_slug = ${hood.slug} order by updated_at desc`
      const hit = open.find((t: any) => sameStreet(mine, streetOf(t.address)))
        ?? (place ? open.filter((t: any) => t.lat != null).map((t: any) => ({ t, d: distanceM(place!, t) })).filter((x: any) => x.d <= AUTO_JOIN_M).sort((x: any, y: any) => x.d - y.d)[0]?.t : undefined)
      if (hit) near = [hit]
    }
    let topic = near[0]
    if (!topic) {
      const base = `${CATEGORY[r.category]} em ${streetLabel(r.address)}`
      const slug = (base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)).slice(0, 80)
      ;[topic] = await sql`insert into topics (slug, title, category, audiences, address, neighborhood, neighborhood_slug, lat, lng, heading, summary, photo_description)
        values (${slug}, ${base}, ${r.category}, ${['visual']}, ${r.address}, ${hood.name}, ${hood.slug}, ${place?.lat ?? null}, ${place?.lng ?? null}, ${place?.heading ?? null}, ${r.body || r.caption}, ${r.caption}) returning id, slug`
      await sql`insert into timeline (topic_id, happened_on, title, body) values (${topic.id}, current_date, 'Primeiro relato', 'Relato enviado pelo AJA.')`
    } else if (place) {
      await sql`update topics set lat = coalesce(lat, ${place.lat}), lng = coalesce(lng, ${place.lng}), heading = coalesce(heading, ${place.heading}) where id = ${topic.id}`
    }
    await sql`insert into reports (topic_id, user_id, category, format, body, caption, media_key, media_type, address, passes_by, lat, lng, heading, maps_url)
      values (${topic.id}, ${userId}, ${r.category}, ${format}, ${r.body}, ${r.caption}, ${mediaKey}, ${file?.type ?? null}, ${r.address}, ${r.passesBy === 'true'},
        ${place?.lat ?? null}, ${place?.lng ?? null}, ${place?.heading ?? null}, ${r.mapsUrl || null})`
    await sql`update topics set updated_at = now() where id = ${topic.id}`
    await advance(topic.id)
    if (userId) {
      if (r.passesBy === 'true') await sql`insert into supports (topic_id, user_id, passes_by) values (${topic.id}, ${userId}, true) on conflict (topic_id, user_id) do update set passes_by = true`
    }
    return { slug: topic.slug, joined: Boolean(near[0]) }
  })

  // Tópicos que podem ser a mesma barreira: mesma rua (qualquer categoria) ou até 150 m de distância.
  app.get('/api/relatos/parecidos', async (req) => {
    const q = req.query as { categoria?: string; bairro?: string; endereco?: string; lat?: string; lng?: string }
    const hood = await hoodBySlug(q.bairro)
    const mine = streetOf(q.endereco ?? '')
    const lat = Number(q.lat), lng = Number(q.lng)
    const here = Number.isFinite(lat) && Number.isFinite(lng) && q.lat && q.lng ? { lat, lng } : null
    const rows = await sql`${topicSelect(null)} where t.stage < 6 and t.neighborhood_slug = ${hood.slug}`
    return rows
      .map((t: any) => {
        const d = here && t.lat != null ? Math.round(distanceM(here, t)) : null
        const street = sameStreet(mine, streetOf(t.address))
        return { t, d, street, same: t.category === q.categoria }
      })
      .filter((x: any) => x.street || (x.d != null && x.d <= SUGGEST_M))
      .sort((a: any, b: any) => Number(b.same) - Number(a.same) || (a.d ?? 9e9) - (b.d ?? 9e9))
      .slice(0, 4)
      .map((x: any) => ({ ...shape(x.t), distance: x.d, sameCategory: x.same }))
  })

  app.get('/api/arquivos/relatos/:name', async (req, reply) => {
    const key = `relatos/${(req.params as any).name}`
    const data = await loadFile(key)
    if (!data) return reply.code(404).send({ erro: 'Arquivo não encontrado.' })
    const [r] = await sql`select media_type from reports where media_key = ${key} union all select media_type from comments where media_key = ${key} limit 1`
    reply.header('Content-Type', r?.media_type ?? 'application/octet-stream')
    reply.header('Cache-Control', 'public, max-age=86400')
    return reply.send(data)
  })

  // Conquistas.
  app.get('/api/conquistas', async (req) => {
    const userId = await currentUserId(req)
    const rows = await sql`${topicSelect(userId)} where t.stage >= 5 order by t.updated_at desc`
    const out: any[] = []
    for (const t of rows) {
      const [quote] = await sql`select body, kind from comments where topic_id = ${t.id} and parent_id is null order by seed_helpful desc limit 1`
      const [last] = await sql`select happened_on from timeline where topic_id = ${t.id} order by happened_on desc limit 1`
      out.push({ ...shape(t), quote: quote ?? null, months: Math.max(1, Math.round((new Date(last?.happened_on ?? Date.now()).getTime() - new Date(t.created_at).getTime()) / (30 * 86400000))) })
    }
    return out
  })

  // Perfil de voluntário.
  app.get('/api/voluntarios/:id', async (req, reply) => {
    const id = z.string().uuid().safeParse((req.params as any).id)
    if (!id.success) return reply.code(404).send({ erro: 'Perfil não encontrado.' })
    const [u] = await sql`select id, name, role, profession, bio, tags, verified, links from users where id = ${id.data} and role = 'voluntario'`
    if (!u) return reply.code(404).send({ erro: 'Perfil não encontrado.' })
    const contribs = await sql`select c.kind, c.title, c.body, c.happened_on, t.slug from contributions c left join topics t on t.id = c.topic_id where c.user_id = ${u.id} order by c.happened_on desc`
    const [counts] = await sql`select
      count(*) filter (where kind = 'orientacao')::int as orientacoes,
      count(*) filter (where kind = 'concept')::int as concepts,
      count(*) filter (where kind = 'conquista')::int as conquistas from contributions where user_id = ${u.id}`
    return { ...u, counts: { orientacoes: counts.orientacoes + 12, concepts: counts.concepts + 2, conquistas: counts.conquistas, agradecimentos: 46 }, contributions: contribs.map((c: any) => ({ ...c, ago: since(c.happened_on) })) }
  })
  app.get('/api/voluntarios', async () => sql`select id, name, profession from users where role = 'voluntario' order by name`)

  // Acompanhar.
  app.get('/api/acompanhar', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const mine = await sql`${topicSelect(userId)} where t.id in (select topic_id from reports where user_id = ${userId}) order by t.updated_at desc`
    const supported = await sql`${topicSelect(userId)} where t.id in (select topic_id from supports where user_id = ${userId}) order by t.updated_at desc`
    const pend = await sql`select p.body, t.slug from pendencies p join topics t on t.id = p.topic_id where p.open and t.id in (select topic_id from supports where user_id = ${userId} union select topic_id from reports where user_id = ${userId})`
    return { relatos: mine.map(shape), apoios: supported.map(shape), pendencias: pend }
  })

  app.get('/api/notificacoes', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    const rows = await sql`select n.id, n.kind, n.title, n.body, n.link, n.actor_name, n.read_at, n.created_at, t.title as topic, t.slug
      from notifications n left join topics t on t.id = n.topic_id where n.user_id = ${userId} order by n.created_at desc limit 50`
    return rows.map((n: any) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, topic: n.topic, href: n.slug ? `/topicos/${n.slug}${n.link ?? ''}` : null,
      actor: n.actor_name, read: Boolean(n.read_at), ago: since(n.created_at) }))
  })
  app.post('/api/notificacoes/lidas', async (req, reply) => {
    const userId = await requireUser(req, reply); if (!userId) return
    await sql`update notifications set read_at = now() where user_id = ${userId} and read_at is null`
    return { ok: true }
  })

  // Quem enviou um relato pode corrigir o texto ou excluí-lo.
  const ownReport = async (req: any, reply: any) => {
    const userId = await requireUser(req, reply); if (!userId) return null
    const id = z.string().uuid().safeParse(req.params.id)
    if (!id.success) { reply.code(400).send({ erro: 'Relato inválido.' }); return null }
    const [r] = await sql`select r.*, t.slug, t.stage from reports r join topics t on t.id = r.topic_id where r.id = ${id.data}`
    if (!r) { reply.code(404).send({ erro: 'Relato não encontrado.' }); return null }
    if (r.user_id !== userId) { reply.code(403).send({ erro: 'Só quem enviou pode mudar este relato.' }); return null }
    return { r, userId }
  }
  const EditReport = z.object({ body: z.string().trim().max(4000).optional(), caption: z.string().trim().max(1000).optional() })
  app.patch('/api/relatos/:id', async (req, reply) => {
    const own = await ownReport(req, reply); if (!own) return
    const parsed = EditReport.safeParse(req.body ?? {})
    if (!parsed.success) return reply.code(400).send({ erro: 'Texto longo demais.' })
    const body = parsed.data.body ?? own.r.body, caption = parsed.data.caption ?? own.r.caption
    if (!body && !caption && !own.r.media_key && !own.r.maps_url) return reply.code(400).send({ erro: 'O relato não pode ficar vazio. Para tirar tudo, exclua o relato.' })
    await sql`update reports set body = ${body}, caption = ${caption} where id = ${own.r.id}`
    await sql`update topics set updated_at = now() where id = ${own.r.topic_id}`
    return { ok: true }
  })
  app.delete('/api/relatos/:id', async (req, reply) => {
    const own = await ownReport(req, reply); if (!own) return
    await sql`delete from reports where id = ${own.r.id}`
    if (own.r.media_key) await deleteFile(own.r.media_key)
    // Um tópico que ficou sem nenhum relato, ainda no começo e sem participação de outras pessoas, sai junto.
    const [left] = await sql`select count(*)::int as n from reports where topic_id = ${own.r.topic_id}`
    const [others] = await sql`select
      (select count(*)::int from comments where topic_id = ${own.r.topic_id} and coalesce(user_id::text, '') <> ${own.userId}) +
      (select count(*)::int from supports where topic_id = ${own.r.topic_id} and user_id <> ${own.userId}) as n`
    const [seed] = await sql`select seed_supports from topics where id = ${own.r.topic_id}`
    if (left.n === 0 && own.r.stage < 2 && others.n === 0 && !seed?.seed_supports) {
      await sql`delete from topics where id = ${own.r.topic_id}`
      return { topicDeleted: true }
    }
    await sql`update topics set updated_at = now() where id = ${own.r.topic_id}`
    await advance(own.r.topic_id)
    return { topicDeleted: false, slug: own.r.slug }
  })

  // Pergunte ao AJA: repertório de respostas prontas.
  app.get('/api/perguntas', async (req) => {
    const q = req.query as { contextos?: string }
    const ctx = (q.contextos ?? 'geral').split(',').map((c) => c.trim()).filter(Boolean).slice(0, 6)
    return sql`select id, context, question, answer from questions where context in ${sql(ctx)} order by sort`
  })
}
