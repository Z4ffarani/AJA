import { NextResponse, type NextRequest } from 'next/server'

// Endereço antigo: agora faz parte da aba Proposta.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return NextResponse.redirect(new URL(`/topicos/${encodeURIComponent(slug)}/proposta#concept`, req.url), 308)
}
