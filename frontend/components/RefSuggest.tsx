'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from './Icon'

export function RefSuggest({ slug }: { slug: string }) {
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const path = usePathname()
  return (
    <form className="card" onSubmit={async (e) => {
      e.preventDefault(); setErro(''); setMsg('')
      const f = e.currentTarget
      const res = await fetch(`/api/topicos/${slug}/referencias`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: new FormData(f).get('text') }) })
      if (res.status === 401) { router.push(`/entrar?voltar=${encodeURIComponent(path)}`); return }
      if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível enviar.'); return }
      f.reset(); setMsg('Enviada! Um voluntário vai conferir.'); router.refresh()
    }}>
      <h2 className="ch"><Icon name="link" />Sugerir referência</h2>
      <div className="field"><label htmlFor="r1">Link ou nome do documento</label><input className="input" id="r1" name="text" required minLength={4} maxLength={500} placeholder="https://" /></div>
      <button className="btn full sm" type="submit">Enviar para conferência</button>
      <p aria-live="polite" className="small c-green">{msg}</p>
      {erro && <p className="error" role="alert">{erro}</p>}
    </form>
  )
}
