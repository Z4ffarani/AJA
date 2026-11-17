// Escolhe o bairro: guarda num cookie e volta para a página inicial.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ok = /^[a-z0-9-]{2,60}$/.test(slug)
  const headers = new Headers({ Location: '/' })
  if (ok) headers.append('Set-Cookie', `aja_bairro=${slug}; Path=/; Max-Age=31536000; SameSite=Lax`)
  return new Response(null, { status: 303, headers })
}
