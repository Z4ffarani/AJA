// Repassa as chamadas do navegador para o back-end (mesma origem, cookie de sessão httpOnly).
import type { NextRequest } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'
const HOP = new Set(['connection', 'keep-alive', 'transfer-encoding', 'host', 'content-length', 'accept-encoding'])

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const url = `${BACKEND}/api/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`
  const headers = new Headers()
  req.headers.forEach((v, k) => { if (!HOP.has(k)) headers.set(k, v) })
  headers.set('x-forwarded-for', req.headers.get('x-forwarded-for') ?? '')
  const init: RequestInit & { duplex?: 'half' } = { method: req.method, headers, redirect: 'manual' }
  if (!['GET', 'HEAD'].includes(req.method)) { init.body = req.body; init.duplex = 'half' }
  const res = await fetch(url, init)
  const out = new Headers()
  res.headers.forEach((v, k) => { if (!HOP.has(k) && k !== 'content-encoding' && k !== 'set-cookie') out.set(k, v) })
  for (const c of res.headers.getSetCookie()) out.append('set-cookie', c)
  return new Response(res.body, { status: res.status, headers: out })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH }
