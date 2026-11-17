// Configuração lida das variáveis de ambiente.

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
  return value
}

const isProd = process.env.NODE_ENV === 'production'

export const config = {
  port: Number(process.env.PORT ?? 8080),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: new TextEncoder().encode(isProd ? required('JWT_SECRET') : (process.env.JWT_SECRET ?? 'segredo-local-de-desenvolvimento-troque-em-producao')),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim()).filter(Boolean),
  isProd,
  s3: process.env.BUCKET
    ? {
        bucket: required('BUCKET'),
        endpoint: required('ENDPOINT'),
        region: process.env.REGION ?? 'auto',
        accessKeyId: required('ACCESS_KEY_ID'),
        secretAccessKey: required('SECRET_ACCESS_KEY'),
      }
    : null,
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
}
