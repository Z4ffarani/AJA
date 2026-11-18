'use client'
import { useState } from 'react'

// soon: recurso ainda não disponível; a chave aparece desligada e não responde.
export function Toggle({ label, sub, on = false, soon = false, onChange }: { label: string; sub?: string; on?: boolean; soon?: boolean; onChange?: (v: boolean) => void }) {
  const [v, setV] = useState(soon ? false : on)
  return (
    <div className="row sb top" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span><b>{label}</b>{soon && <> <span className="badge gray">Em breve</span></>}{sub && <><br /><span className="small muted">{sub}</span></>}</span>
      <button type="button" role="switch" aria-checked={v} aria-disabled={soon || undefined} aria-label={soon ? `${label}, em breve` : label}
        className={`toggle${v ? ' on' : ''}${soon ? ' soon' : ''}`} style={{ border: 0, cursor: soon ? 'not-allowed' : 'pointer' }}
        onClick={() => { if (soon) return; setV(!v); onChange?.(!v) }} />
    </div>
  )
}
