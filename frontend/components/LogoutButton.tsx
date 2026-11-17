'use client'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export function LogoutButton() {
  const router = useRouter()
  return <button className="btn sec sm" type="button" onClick={async () => { await fetch('/api/auth/sair', { method: 'POST' }); router.push('/'); router.refresh() }}><Icon name="signout" />Sair</button>
}
