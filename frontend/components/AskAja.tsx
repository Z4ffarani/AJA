'use client'
import { useState } from 'react'
import type { Question } from '@/lib/types'
import { Icon } from './Icon'
import { ListenButton } from './ListenButton'

// "Pergunte ao AJA": perguntas prontas em caixinhas, sem campo de digitação.
export function AskAja({ questions, title = 'Pergunte ao AJA', limit = 6 }: { questions: Question[]; title?: string; limit?: number }) {
  const [open, setOpen] = useState<number | null>(null)
  const [all, setAll] = useState(false)
  if (!questions.length) return null
  const list = all ? questions : questions.slice(0, limit)
  const current = questions.find((q) => q.id === open)
  return (
    <section className="card ask" aria-labelledby="ask-t">
      <h2 className="ch" id="ask-t"><Icon name="question" />{title}</h2>
      <p className="small muted">Toque numa pergunta para ver a resposta.</p>
      <div className="ask-chips" role="list">
        {list.map((q) => (
          <div role="listitem" key={q.id}>
            <button type="button" className={`ask-chip${open === q.id ? ' on' : ''}`} aria-expanded={open === q.id} aria-controls="ask-resposta" onClick={() => setOpen(open === q.id ? null : q.id)}>
              {q.question}
            </button>
          </div>
        ))}
      </div>
      {questions.length > limit && (
        <button type="button" className="more-replies" onClick={() => setAll(!all)}><Icon name={all ? 'caretup' : 'caretdown'} />{all ? 'Mostrar menos' : `Ver mais ${questions.length - limit} perguntas`}</button>
      )}
      <div id="ask-resposta" aria-live="polite">
        {current && (
          <div className="ask-answer">
            <p className="h4">{current.question}</p>
            <p>{current.answer}</p>
            <div className="row wrapr"><ListenButton text={`${current.question}. ${current.answer}`} label="Ouvir resposta" /></div>
            <p className="xs muted">Resposta preparada pelo AJA. Pode não cobrir todos os casos.</p>
          </div>
        )}
      </div>
    </section>
  )
}
