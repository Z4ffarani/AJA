import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config } from './config.js'

export const sql = postgres(config.databaseUrl, {
  max: 10,
  onnotice: () => {},
  ssl: config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1') || config.databaseUrl.includes('.railway.internal') ? false : 'prefer',
})

const here = dirname(fileURLToPath(import.meta.url))

export async function migrate() {
  const schema = readFileSync(join(here, 'schema.sql'), 'utf8')
  await sql.unsafe(schema)
}
