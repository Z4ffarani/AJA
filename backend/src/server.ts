import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { config } from './config.js'
import { migrate } from './db.js'
import { seedIfEmpty } from './seed/run.js'
import { apiRoutes } from './routes/api.js'

const app = Fastify({ logger: { level: config.isProd ? 'info' : 'warn', redact: ['req.headers.authorization', 'req.headers.cookie'] }, trustProxy: true, bodyLimit: 1_000_000 })

await app.register(cors, { origin: config.allowedOrigins, credentials: true })
await app.register(cookie)
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' })
await app.register(multipart, { limits: { fileSize: 60 * 1024 * 1024, files: 1, fields: 10 } })

app.addHook('onSend', async (_req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})

app.setErrorHandler((err: any, _req, reply) => {
  if (err.statusCode === 429) return reply.code(429).send({ erro: 'Muitas tentativas. Aguarde um pouco e tente de novo.' })
  if (err.statusCode === 413 || err.code === 'FST_REQ_FILE_TOO_LARGE') return reply.code(413).send({ erro: 'Arquivo grande demais. O limite é 60 MB.' })
  if (err.name === 'ZodError') return reply.code(400).send({ erro: 'Dados inválidos.' })
  app.log.error(err)
  return reply.code(500).send({ erro: 'Algo deu errado do nosso lado. Tente de novo.' })
})

await app.register(apiRoutes)

await migrate()
await seedIfEmpty()
await app.listen({ port: config.port, host: process.env.HOST ?? '::' })
