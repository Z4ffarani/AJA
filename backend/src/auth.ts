import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { SignJWT, jwtVerify } from 'jose'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from './config.js'

const scryptAsync = promisify(scrypt) as (p: string, s: Buffer, k: number) => Promise<Buffer>

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function checkPassword(password: string, stored: string) {
  const [alg, saltB64, keyB64] = stored.split('$')
  if (alg !== 'scrypt' || !saltB64 || !keyB64) return false
  const key = await scryptAsync(password, Buffer.from(saltB64, 'base64'), 64)
  const expected = Buffer.from(keyB64, 'base64')
  return expected.length === key.length && timingSafeEqual(expected, key)
}

export const COOKIE = 'aja_sessao'
const SESSION_DAYS = 30

export async function signSession(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(config.jwtSecret)
}

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  })
}

// Lê a sessão do cookie (navegador, via proxy do front) ou do cabeçalho Authorization (servidor do front).
export async function currentUserId(req: FastifyRequest): Promise<string | null> {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, config.jwtSecret, { algorithms: ['HS256'] })
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

export async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const id = await currentUserId(req)
  if (!id) {
    reply.code(401).send({ erro: 'Entre na sua conta para continuar.' })
    return null
  }
  return id
}
