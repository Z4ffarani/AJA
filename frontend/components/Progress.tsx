const STAGES = ['Relatado', 'Tópico', 'Dossiê', 'Protocolo', 'Em execução', 'Verificado']

export function Progress({ stage, note = '', steps = true }: { stage: number; note?: string; steps?: boolean }) {
  const done = stage >= 6
  const label = done ? 'Etapa 6 de 6 · Verificado pela comunidade' : `Etapa ${stage + 1} de 6 · ${STAGES[stage]}`
  return (
    <div className={`prog${done ? ' done' : ''}`} role="group" aria-label={`Andamento: ${label}${note ? `. ${note}` : ''}`}>
      <div className="lg"><b>{label}</b><span className="muted">{note}</span></div>
      <div className="bars" aria-hidden="true">
        {STAGES.map((_, i) => <i key={i} className={done ? '' : i < stage ? 'd' : i === stage ? 'c' : ''} />)}
      </div>
      {steps && (
        <div className="steps" aria-hidden="true">
          {STAGES.map((s, i) => <span key={s} className={i === stage && !done ? 'c' : undefined}>{s}</span>)}
        </div>
      )}
    </div>
  )
}

export function Tags({ list }: { list: string[] }) {
  return <div className="row wrapr">{list.map((t) => <span key={t} className="tag">{t}</span>)}</div>
}
