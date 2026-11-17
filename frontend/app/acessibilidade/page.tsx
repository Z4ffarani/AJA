import { api, getPrefs } from '@/lib/api'
import type { Question } from '@/lib/types'
import { MHead } from '@/components/Shell'
import { A11yPanel } from '@/components/A11yPanel'
import { AskAja } from '@/components/AskAja'

export const metadata = { title: 'Acessibilidade' }

export default async function Acessibilidade() {
  const [prefs, perguntas] = await Promise.all([getPrefs(), api<Question[]>('/api/perguntas?contextos=acessibilidade,libras')])
  return (
    <>
      <MHead back="/" title="Acessibilidade" />
      <main className="wrap" id="conteudo">
        <div className="stack s4"><h1 className="h1">Acessibilidade</h1><p className="muted big">Ajuste o AJA do seu jeito. As escolhas ficam salvas neste aparelho.</p></div>
        <A11yPanel initial={prefs} askAja={<AskAja questions={perguntas} limit={5} />} />
      </main>
    </>
  )
}
