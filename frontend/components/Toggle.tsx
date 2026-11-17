'use client'
import { useState } from 'react'

export function Toggle({ label, sub, on = false, onChange }: { label: string; sub?: string; on?: boolean; onChange?: (v: boolean) => void }) {
  const [v, setV] = useState(on)
  return (
    <div className="row sb top" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span><b>{label}</b>{sub && <><br /><span className="small muted">{sub}</span></>}</span>
      <button type="button" role="switch" aria-checked={v} aria-label={label} className={`toggle${v ? ' on' : ''}`} style={{ border: 0, cursor: 'pointer' }}
        onClick={() => { setV(!v); onChange?.(!v) }} />
    </div>
  )
}
