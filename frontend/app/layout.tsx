import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import './app.css'
import { api, getPrefs } from '@/lib/api'
import { Bar, MNav } from '@/components/Shell'
import { VLibras } from '@/components/Libras'
import type { User } from '@/lib/types'

const atkinson = localFont({
  src: [
    { path: './fonts/atkinson-hyperlegible-next-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/atkinson-hyperlegible-next-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/atkinson-hyperlegible-next-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-atkinson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'AJA · Participação cidadã', template: '%s · AJA' },
  description: 'Relate barreiras de acessibilidade do seu bairro, apoie melhorias e acompanhe a resposta da prefeitura.',
  icons: { icon: '/icon.png' },
}

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#FFFFFF' }, { media: '(prefers-color-scheme: dark)', color: '#171B23' }],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = await getPrefs()
  const { usuario } = await api<{ usuario: User | null }>('/api/eu').catch(() => ({ usuario: null }))
  const classes = ['aja', prefs.tema, prefs.contraste ? 'contraste' : '', prefs.movimento ? 'sem-movimento' : ''].filter(Boolean).join(' ')
  return (
    <html lang="pt-BR" className={atkinson.variable} style={{ fontSize: `${prefs.texto}%` }}>
      <body>
        <div className={classes}>
          <a className="skip" href="#conteudo">Pular para o conteúdo</a>
          <div className="app">
            <Bar user={usuario} />
            {children}
            <MNav user={usuario} />
          </div>
          {prefs.libras && <VLibras />}
        </div>
      </body>
    </html>
  )
}
