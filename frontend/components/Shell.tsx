'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from './Icon'
import { LibrasButton } from './Libras'
import type { User } from '@/lib/types'

const LINKS = [['Início', '/'], ['Acompanhar', '/acompanhar'], ['Conquistas', '/conquistas']] as const

function activeOf(path: string) {
  if (path.startsWith('/acompanhar')) return 'Acompanhar'
  if (path.startsWith('/conquistas')) return 'Conquistas'
  if (path === '/' || path.startsWith('/topicos')) return 'Início'
  return ''
}

export function Bar({ user }: { user: User | null }) {
  const active = activeOf(usePathname())
  const unread = user?.naoLidas ?? 0
  const router = useRouter()
  return (
    <header className="bar">
      <Link href="/" aria-label="AJA, página inicial"><span className="logo" /></Link>
      <nav aria-label="Principal">
        {LINKS.map(([t, href]) => (
          <Link key={t} className={`navlink${t === active ? ' on' : ''}`} href={href} aria-current={t === active ? 'page' : undefined}>{t}</Link>
        ))}
      </nav>
      <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('busca'); router.push(`/?busca=${encodeURIComponent(String(q ?? ''))}`) }}>
        <Icon name="search" />
        <label className="sr" htmlFor="busca-d">Buscar</label>
        <input id="busca-d" name="busca" type="search" placeholder="Buscar barreira, rua ou tema" style={{ border: 0, background: 'transparent', flex: 1, minWidth: 0, color: 'var(--ink)', font: 'inherit' }} />
      </form>
      <Link className="iconbtn" href="/acessibilidade" aria-label="Acessibilidade e tema"><Icon name="text" /></Link>
      <LibrasButton />
      <Link className="iconbtn" href={user ? '/acompanhar?aba=notificacoes' : '/entrar?voltar=/acompanhar?aba=notificacoes'} aria-label={unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações'}><Icon name="bell" />{unread > 0 && <span className="nbadge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}</Link>
      <Link className="btn sm" href="/relatar"><Icon name="plus" />Relatar barreira</Link>
      {user
        ? <Link className="avatar" href="/acompanhar" aria-label={`Minha conta: ${user.name}`}>{user.name.trim()[0]?.toUpperCase()}</Link>
        : <Link className="btn sec sm" href="/entrar">Entrar</Link>}
    </header>
  )
}

export function MHead({ back, title }: { back?: string; title?: string }) {
  return (
    <header className="mhead">
      {back
        ? <><Link className="iconbtn ghost" href={back} aria-label="Voltar"><Icon name="back" /></Link><span className="ttl">{title}</span></>
        : <><Link href="/" aria-label="AJA, página inicial" style={{ flex: 1, display: 'flex' }}><span className="logo sm" /></Link>
            <Link className="iconbtn" href="/?foco=busca" aria-label="Buscar"><Icon name="search" /></Link></>}
      <Link className="iconbtn" href="/acessibilidade" aria-label="Acessibilidade e tema"><Icon name="text" /></Link>
      <LibrasButton />
    </header>
  )
}

const NAV = [['home', 'Início', '/'], ['list', 'Acompanhar', '/acompanhar'], ['plus', 'Relatar', '/relatar'], ['star', 'Conquistas', '/conquistas'], ['user', 'Perfil', '/entrar']] as const

export function MNav({ user }: { user: User | null }) {
  const path = usePathname()
  const unread = user?.naoLidas ?? 0
  if (path.startsWith('/relatar') || path.startsWith('/topicos')) return null
  const active = path === '/' ? 'Início' : path.startsWith('/acompanhar') ? 'Acompanhar' : path.startsWith('/conquistas') ? 'Conquistas' : path.startsWith('/entrar') ? 'Perfil' : ''
  return (
    <nav className="mnav" aria-label="Navegação">
      {NAV.map(([ic, t, href]) => t === 'Relatar'
        ? <Link key={t} className="rel" href={href}><span className="plus"><Icon name="plus" /></span>Relatar</Link>
        : <Link key={t} className={t === active ? 'on' : undefined} aria-current={t === active ? 'page' : undefined} href={t === 'Perfil' && user ? '/acompanhar' : href}
            >
            <span className="nwrap"><Icon name={ic} size={24} />{t === 'Acompanhar' && unread > 0 && <span className="nbadge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}</span>{t}
            {t === 'Acompanhar' && unread > 0 && <span className="sr">, {unread} {unread === 1 ? 'notificação nova' : 'notificações novas'}</span>}</Link>)}
    </nav>
  )
}
