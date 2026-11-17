// Tarefas de manutenção que rodam uma vez na inicialização, ligadas pela variável AJA_TAREFA.
//   inventario:<parte do nome>  → só lista as contas que batem e o que cada uma fez (não apaga nada)
//   limpar:<id da conta>        → apaga tudo o que a conta fez, mas mantém a conta
// Depois de usar, a variável deve ser removida.
import { sql } from './db.js'
import { deleteFile } from './storage.js'

const mask = (email: string) => email.replace(/^(.).*?(@.*)$/, '$1***$2')

async function activity(id: string) {
  const [c] = await sql`select
    (select count(*)::int from reports where user_id = ${id}) as relatos,
    (select count(*)::int from reports where user_id = ${id} and media_key is not null) as arquivos,
    (select count(*)::int from comments where user_id = ${id}) as comentarios,
    (select count(*)::int from comments where parent_id in (select id from comments where user_id = ${id}) and coalesce(user_id::text, '') <> ${id}) as respostas_de_outros,
    (select count(*)::int from supports where user_id = ${id}) as apoios,
    (select count(*)::int from comment_helpful where user_id = ${id}) as uteis,
    (select count(*)::int from ratings where user_id = ${id}) as avaliacoes,
    (select count(*)::int from verifications where user_id = ${id}) as verificacoes,
    (select count(*)::int from contributions where user_id = ${id}) as contribuicoes,
    (select count(*)::int from notifications where actor_id = ${id}) as notificacoes_geradas,
    (select count(distinct topic_id)::int from reports where user_id = ${id}) as topicos_relatados`
  const topics = await sql`select t.slug, t.title, t.stage,
      (select count(*)::int from reports r where r.topic_id = t.id and coalesce(r.user_id::text, '') <> ${id}) as relatos_de_outros,
      t.seed_supports > 0 as exemplo
    from topics t where t.id in (select topic_id from reports where user_id = ${id})`
  return { ...c, topicos: topics }
}

export async function runTask() {
  const task = process.env.AJA_TAREFA?.trim()
  if (!task) return
  const [kind, arg] = [task.split(':')[0], task.slice(task.indexOf(':') + 1).trim()]

  if (kind === 'inventario' && arg) {
    const users = await sql`select id, name, email, role, created_at from users where name ilike ${'%' + arg + '%'} order by created_at`
    console.log(`[tarefa] inventario "${arg}": ${users.length} conta(s)`)
    for (const u of users) {
      console.log('[tarefa] conta', JSON.stringify({ id: u.id, nome: u.name, email: mask(u.email), papel: u.role, criada: u.created_at }))
      console.log('[tarefa] atividade', JSON.stringify(await activity(u.id)))
    }
    return
  }

  if (kind === 'limpar' && /^[0-9a-f-]{36}$/.test(arg)) {
    const [u] = await sql`select id, name from users where id = ${arg}`
    if (!u) { console.log('[tarefa] limpar: conta não encontrada'); return }
    const antes = await activity(u.id)
    const topicIds = (await sql`select distinct topic_id from reports where user_id = ${u.id}`).map((r: any) => r.topic_id)
    const files = (await sql`select media_key from reports where user_id = ${u.id} and media_key is not null union all select media_key from comments where user_id = ${u.id} and media_key is not null`).map((r: any) => r.media_key)
    await sql.begin(async (tx: any) => {
      await tx`delete from notifications where actor_id = ${u.id}`
      await tx`delete from comment_helpful where user_id = ${u.id}`
      await tx`delete from comments where user_id = ${u.id}`
      await tx`delete from supports where user_id = ${u.id}`
      await tx`delete from ratings where user_id = ${u.id}`
      await tx`delete from verifications where user_id = ${u.id}`
      await tx`delete from contributions where user_id = ${u.id}`
      await tx`delete from reports where user_id = ${u.id}`
      // Tópicos abertos pelos relatos dele que ficaram vazios e sem participação de outras pessoas saem junto.
      for (const tid of topicIds) {
        const [left] = await tx`select
          (select count(*)::int from reports where topic_id = ${tid}) +
          (select count(*)::int from comments where topic_id = ${tid}) +
          (select count(*)::int from supports where topic_id = ${tid}) as n,
          (select seed_supports from topics where id = ${tid}) as seed`
        if (left.n === 0 && !left.seed) await tx`delete from topics where id = ${tid}`
      }
    })
    for (const k of files) await deleteFile(k)
    const depois = await activity(u.id)
    console.log('[tarefa] limpar', JSON.stringify({ conta: u.name, id: u.id, antes, depois, arquivos_apagados: files.length }))
    return
  }
  console.log('[tarefa] AJA_TAREFA não reconhecida; nada foi feito')
}
