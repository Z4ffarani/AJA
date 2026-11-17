import { MHead } from '@/components/Shell'
import { LoginForm } from '@/components/LoginForm'

export const metadata = { title: 'Entrar' }

export default async function Entrar({ searchParams }: { searchParams: Promise<{ voltar?: string; modo?: string }> }) {
  const sp = await searchParams
  const voltar = sp.voltar?.startsWith('/') && !sp.voltar.startsWith('//') ? sp.voltar : '/'
  return (
    <>
      <MHead back="/" title="Entrar" />
      <main className="wrap" id="conteudo" style={{ maxWidth: 560 }}>
        <LoginForm voltar={voltar} cadastro={sp.modo === 'cadastro'} />
      </main>
    </>
  )
}
