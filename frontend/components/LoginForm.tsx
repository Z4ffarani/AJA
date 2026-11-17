'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export function LoginForm({ voltar, cadastro: initial }: { voltar: string; cadastro: boolean }) {
  const [cadastro, setCadastro] = useState(initial)
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErro(''); setBusy(true)
    const f = new FormData(e.currentTarget)
    const res = await fetch(cadastro ? '/api/auth/cadastro' : '/api/auth/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(f)) })
    setBusy(false)
    if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível entrar.'); return }
    router.push(voltar); router.refresh()
  }
  return (
    <>
      <form className="card p28 stack s24" onSubmit={submit} aria-labelledby="entrar-t">
        <div className="stack s8"><span className="logo" style={{ height: 36, alignSelf: 'flex-start' }} role="img" aria-label="AJA" />
          <h1 className="h1" id="entrar-t">{cadastro ? 'Criar conta no AJA' : 'Entrar no AJA'}</h1>
          <p className="muted">Para apoiar, comentar e acompanhar. Ler e relatar você pode sem conta.</p></div>
        <div className="seg" role="tablist" aria-label="Entrar ou criar conta">
          {[['Entrar', false], ['Criar conta', true]].map(([l, v]) => (
            <button key={String(l)} type="button" role="tab" aria-selected={cadastro === v} onClick={() => { setCadastro(v as boolean); setErro('') }}>{l as string}</button>
          ))}
        </div>
        {cadastro && <div className="field"><label htmlFor="e0">Como quer ser chamado(a)</label><input className="input" id="e0" name="name" required minLength={2} maxLength={60} autoComplete="nickname" placeholder="Ex.: Marta S." /></div>}
        <div className="field"><label htmlFor="e1">E-mail</label><input className="input" id="e1" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" /></div>
        <div className="field"><label htmlFor="e2">Senha</label><input className="input" id="e2" name="password" type="password" required minLength={cadastro ? 8 : 1} autoComplete={cadastro ? 'new-password' : 'current-password'} aria-describedby={cadastro ? 'e2-dica' : undefined} />{cadastro && <span id="e2-dica" className="small muted">Mínimo de 8 caracteres.</span>}</div>
        {erro && <p className="error" role="alert">{erro}</p>}
        <button className="btn full" type="submit" disabled={busy}><Icon name={cadastro ? 'user' : 'lock'} />{busy ? 'Aguarde…' : cadastro ? 'Criar conta' : 'Entrar'}</button>
        <div className="row"><span className="hr grow" /><span className="small muted">em breve</span><span className="hr grow" /></div>
        <button className="btn sec full" type="button" disabled aria-disabled="true"><Icon name="phone" />Código por SMS</button>
        <button className="btn sec full" type="button" disabled aria-disabled="true"><Icon name="user" />Entrar com gov.br</button>
        <div className="card gsoft" style={{ padding: 14 }}><p className="small row top"><Icon name="lock" /><span>Seu nome não aparece no dossiê enviado à prefeitura. A senha é guardada de forma cifrada.</span></p></div>
      </form>
      <Link className="btn ghost" href="/">Continuar sem conta</Link>
    </>
  )
}
