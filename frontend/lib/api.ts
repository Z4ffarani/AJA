import 'server-only'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Prefs } from './types'

export const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'

// Busca no back-end a partir do servidor do front, repassando a sessão do usuário.
export async function api<T>(path: string, opts: { allow404?: boolean } = {}): Promise<T> {
  const token = (await cookies()).get('aja_sessao')?.value
  const res = await fetch(`${BACKEND}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' })
  if (res.status === 404 && !opts.allow404) notFound()
  if (!res.ok && res.status !== 404) throw new Error(`Falha ao buscar ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const DEFAULT_PREFS: Prefs = { tema: 'auto', texto: 100, contraste: false, movimento: false, libras: true, voz: true, legendas: true, avisos: true }

export async function getPrefs(): Promise<Prefs> {
  const raw = (await cookies()).get('aja_prefs')?.value
  if (!raw) return DEFAULT_PREFS
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(decodeURIComponent(raw)) }
  } catch {
    return DEFAULT_PREFS
  }
}
