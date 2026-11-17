// Arquivos enviados (fotos, áudios, vídeos). Em produção: bucket do Railway (S3). Localmente: pasta ./uploads.
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { config } from './config.js'

const s3 = config.s3
  ? new S3Client({
      region: config.s3.region,
      endpoint: config.s3.endpoint,
      forcePathStyle: false,
      credentials: { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey },
    })
  : null

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic',
  'audio/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
}

// O navegador costuma mandar "audio/webm;codecs=opus": vale só o tipo base.
export const baseType = (type: string) => type.split(';')[0].trim().toLowerCase()

export function allowedType(type: string) {
  return baseType(type) in EXT
}

export async function saveFile(buffer: Buffer, rawType: string) {
  const type = baseType(rawType)
  const key = `relatos/${randomUUID()}.${EXT[type] ?? 'bin'}`
  if (s3 && config.s3) {
    await s3.send(new PutObjectCommand({ Bucket: config.s3.bucket, Key: key, Body: buffer, ContentType: type }))
  } else {
    const path = join(config.uploadDir, key)
    await mkdir(join(config.uploadDir, 'relatos'), { recursive: true })
    await writeFile(path, buffer)
  }
  return key
}

export async function loadFile(key: string): Promise<Buffer | null> {
  if (!/^relatos\/[0-9a-f-]{36}\.[a-z0-9]+$/.test(key)) return null
  try {
    if (s3 && config.s3) {
      const out = await s3.send(new GetObjectCommand({ Bucket: config.s3.bucket, Key: key }))
      const bytes = await out.Body?.transformToByteArray()
      return bytes ? Buffer.from(bytes) : null
    }
    return await readFile(join(config.uploadDir, key))
  } catch {
    return null
  }
}

// Apaga um arquivo enviado (quando quem enviou exclui a evidência). Falhas não impedem a exclusão do relato.
export async function deleteFile(key: string) {
  if (!/^relatos\/[0-9a-f-]{36}\.[a-z0-9]+$/.test(key)) return
  try {
    if (s3 && config.s3) await s3.send(new DeleteObjectCommand({ Bucket: config.s3.bucket, Key: key }))
    else await unlink(join(config.uploadDir, key))
  } catch {
    /* o arquivo pode já não existir */
  }
}
