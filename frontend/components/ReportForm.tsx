'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, type IconName } from './Icon'

const CATS: [string, IconName, string][] = [['piso', 'piso', 'Piso tátil interrompido'], ['obstaculo', 'alert', 'Obstáculo na calçada'], ['travessia', 'sound', 'Travessia sem som ou sinal visual'], ['sinalizacao', 'eye', 'Sinalização inadequada'], ['comunicacao', 'chat', 'Falta de comunicação acessível'], ['calcada', 'ruler', 'Calçada quebrada ou irregular'], ['outro', 'more', 'Outra barreira']]
const FMT: [string, IconName, string, string][] = [['texto', 'file', 'Escrever', 'Texto livre, do tamanho que quiser'], ['audio', 'mic', 'Falar', 'Gravação de voz; o AJA transcreve'], ['foto', 'camera', 'Foto ou vídeo', 'O AJA descreve a imagem'], ['libras', 'hand', 'Vídeo em Libras', 'Gravação em Libras; o AJA legenda']]
const STEPS = ['O que e como', 'Onde', 'Revisar']

type Topic = { slug: string; title: string; category: string; address: string; neighborhoodSlug: string } | null
type Hood = { slug: string; name: string }

function Opt({ icon, title, sub, on, onClick }: { icon: IconName; title: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <button className={`opt${on ? ' on' : ''}`} type="button" aria-pressed={on} onClick={onClick}>
      <span className="row"><Icon name={icon} /><b className="grow">{title}</b>{on && <Icon name="check" />}</span>
      {sub && <span className="small muted">{sub}</span>}
    </button>
  )
}

export function ReportForm({ topic, format: initialFormat, bairros, bairro: initialBairro }: { topic: Topic; format?: string; bairros: Hood[]; bairro: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(topic?.category ?? '')
  const [format, setFormat] = useState(FMT.some((f) => f[0] === initialFormat) ? initialFormat! : 'texto')
  const [body, setBody] = useState('')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [address, setAddress] = useState(topic?.address ?? '')
  const [bairro, setBairro] = useState(topic?.neighborhoodSlug ?? initialBairro)
  const [mapsUrl, setMapsUrl] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [passes, setPasses] = useState(true)
  const [erro, setErro] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const rec = useRef<MediaRecorder | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  useEffect(() => { if (first.current) { first.current = false; return } heading.current?.focus() }, [step])

  async function record() {
    if (recording) { rec.current?.stop(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const parts: Blob[] = []
      mr.ondataavailable = (e) => parts.push(e.data)
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const type = mr.mimeType.split(';')[0] || 'audio/webm'
        setFile(new File(parts, `audio.${type.includes('mp4') ? 'm4a' : 'webm'}`, { type }))
        setRecording(false)
      }
      rec.current = mr; mr.start(); setRecording(true)
    } catch { setErro('Não conseguimos acessar o microfone. Você pode enviar um arquivo de áudio.') }
  }

  function locate() {
    if (!navigator.geolocation) { setErro('Seu aparelho não informou a localização. Escreva um ponto de referência.'); return }
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); if (!address.trim()) setAddress(`Localização do aparelho (${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)})`) },
      () => setErro('Não foi possível obter a localização. Escreva um ponto de referência.'),
    )
  }

  function next() {
    setErro('')
    if (step === 0) {
      if (!category) return setErro('Escolha o tipo de barreira.')
      if (format === 'texto' && body.trim().length < 5) return setErro('Conte um pouco mais sobre a barreira.')
      if (format !== 'texto' && !file && !body.trim()) return setErro(format === 'audio' ? 'Grave ou envie um áudio.' : 'Envie uma foto ou um vídeo.')
    }
    if (step === 1 && address.trim().length < 3) return setErro('Diga onde fica a barreira.')
    if (step === 1 && mapsUrl.trim() && !/^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(mapsUrl.trim())) return setErro('Esse não parece um link do Google Maps. Copie o link pelo botão Compartilhar do Google Maps.')
    setStep(step + 1)
  }

  async function send() {
    setSending(true); setErro('')
    const fd = new FormData()
    fd.set('category', category); fd.set('format', format); fd.set('body', body); fd.set('caption', caption)
    fd.set('address', address); fd.set('passesBy', String(passes)); fd.set('neighborhood', bairro)
    if (mapsUrl.trim()) fd.set('mapsUrl', mapsUrl.trim())
    if (coords) { fd.set('lat', String(coords.lat)); fd.set('lng', String(coords.lng)) }
    if (file) fd.set('arquivo', file)
    const res = await fetch('/api/relatos', { method: 'POST', body: fd })
    setSending(false)
    if (!res.ok) { setErro((await res.json().catch(() => ({}))).erro ?? 'Não foi possível enviar agora.'); return }
    const { slug, joined } = await res.json()
    router.push(`/topicos/${slug}?relato=${joined ? 'somado' : 'novo'}`)
    router.refresh()
  }

  const accept = format === 'audio' ? 'audio/*' : format === 'libras' ? 'video/*' : 'image/*,video/*'
  const catLabel = CATS.find((c) => c[0] === category)?.[2]
  const fmtLabel = FMT.find((f) => f[0] === format)?.[2]

  return (
    <form className="card p28 stack s24" aria-labelledby="rel-t" onSubmit={(e) => { e.preventDefault(); if (step < 2) next(); else send() }}>
      <div className="stack s8">
        <h1 className="h1" id="rel-t" tabIndex={-1} ref={heading}>{topic ? 'Adicionar evidência' : 'Relatar uma barreira'}</h1>
        {topic && <p className="muted">Para o tópico: <b>{topic.title}</b></p>}
        <ol className="row wrapr" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Passos">
          {STEPS.map((s, i) => <li key={s} className={`badge ${i === step ? 'blue' : 'gray'}`} aria-current={i === step ? 'step' : undefined}>{i + 1}. {s}</li>)}
        </ol>
      </div>

      {step === 0 && (
        <>
          {!topic && (
            <fieldset className="stack" style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="h3" style={{ marginBottom: 12 }}>O que você encontrou?</legend>
              <div className="cols3">{CATS.map(([k, i, t]) => <Opt key={k} icon={i} title={t} on={category === k} onClick={() => setCategory(k)} />)}</div>
            </fieldset>
          )}
          <fieldset className="stack" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="h3" style={{ marginBottom: 12 }}>Conte do seu jeito</legend>
            <div className="cols2">{FMT.map(([k, i, t, s]) => <Opt key={k} icon={i} title={t} sub={s} on={format === k} onClick={() => { setFormat(k); setFile(null) }} />)}</div>
          </fieldset>
          {format === 'texto' && <div className="field"><label htmlFor="rel-body">Descreva a barreira</label><textarea className="input" id="rel-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} placeholder="Ex.: o piso tátil acaba antes da faixa e eu perco a referência para atravessar." /></div>}
          {format === 'audio' && (
            <div className="card flat stack s8">
              <div className="row wrapr">
                <button type="button" className="btn" onClick={record} aria-pressed={recording}>{recording ? <><span className="rec-dot" aria-hidden="true" />Parar gravação</> : <><Icon name="mic" />Gravar áudio</>}</button>
                <label className="btn sec"><Icon name="file" />Enviar arquivo<input type="file" accept={accept} className="sr" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
              </div>
              {file && <audio controls src={URL.createObjectURL(file)} className="ev-media" />}
              <div className="field"><label htmlFor="rel-tr">Transcrição (opcional, você pode corrigir)</label><textarea className="input" id="rel-tr" value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} placeholder="O AJA transcreve o áudio. Se quiser, escreva ou corrija aqui." /></div>
            </div>
          )}
          {(format === 'foto' || format === 'libras') && (
            <div className="card flat stack s8">
              <label className="btn sec" style={{ alignSelf: 'flex-start' }}><Icon name={format === 'libras' ? 'video' : 'camera'} />{format === 'libras' ? 'Gravar ou enviar vídeo em Libras' : 'Tirar foto ou enviar arquivo'}
                <input type="file" accept={accept} capture="environment" className="sr" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
              {file && (file.type.startsWith('image') ? <img src={URL.createObjectURL(file)} alt="Prévia da foto escolhida" className="ev-media" /> : <video src={URL.createObjectURL(file)} controls className="ev-media" />)}
              <div className="field"><label htmlFor="rel-cap">{format === 'libras' ? 'Legenda (o AJA gera; você pode corrigir)' : 'Descrição da imagem (para quem usa leitor de tela)'}</label>
                <textarea className="input" id="rel-cap" value={format === 'libras' ? body : caption} onChange={(e) => (format === 'libras' ? setBody(e.target.value) : setCaption(e.target.value))} maxLength={1000} placeholder={format === 'libras' ? 'O que você disse no vídeo' : 'Ex.: o piso tátil amarelo termina cerca de 3 m antes da faixa.'} /></div>
            </div>
          )}
          <label className="row top"><input type="checkbox" checked={passes} onChange={(e) => setPasses(e.target.checked)} style={{ width: 24, height: 24, margin: '2px 0 0', accentColor: 'var(--primary)', flex: 'none' }} /><span><b>Eu passo por essa barreira</b><br /><span className="small muted">Opcional. Ajuda a mostrar quem é afetado.</span></span></label>
        </>
      )}

      {step === 1 && (
        <div className="stack">
          <h2 className="h3">Onde fica?</h2>
          {!topic && (
            <div className="field"><label htmlFor="rel-bairro">Bairro</label>
              <select className="input" id="rel-bairro" value={bairro} onChange={(e) => setBairro(e.target.value)}>
                {bairros.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select></div>
          )}
          <button type="button" className="btn sec" style={{ alignSelf: 'flex-start' }} onClick={locate}><Icon name="pin" />{coords ? 'Localização marcada' : 'Usar minha localização'}</button>
          <div className="field"><label htmlFor="rel-addr">Endereço ou ponto de referência</label><input className="input" id="rel-addr" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="Ex.: Rua dos Calangos, perto do nº 300" autoComplete="street-address" /></div>
          <div className="field"><label htmlFor="rel-maps">Link do Google Maps ou Street View (opcional)</label>
            <input className="input" id="rel-maps" type="url" inputMode="url" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} maxLength={600} placeholder="https://maps.app.goo.gl/…" aria-describedby="rel-maps-h" />
            <span className="small muted" id="rel-maps-h">No Google Maps, abra o lugar (ou o Street View apontando para a barreira), toque em Compartilhar e cole o link aqui. A vista do local entra como evidência.</span></div>
          <p className="small muted">Não precisa ser exato. Moradores e voluntários ajudam a confirmar o local.</p>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <h2 className="h3">Revise antes de enviar</h2>
          <div className="kv"><span className="muted">Barreira</span><b>{topic ? topic.title : catLabel}</b></div>
          <div className="kv"><span className="muted">Formato</span><b>{fmtLabel}{file ? ` · ${file.name}` : ''}</b></div>
          {(body || caption) && <div className="kv"><span className="muted">Texto</span><b style={{ textAlign: 'right' }}>{body || caption}</b></div>}
          <div className="kv"><span className="muted">Onde</span><b style={{ textAlign: 'right' }}>{address} · {bairros.find((b) => b.slug === bairro)?.name}</b></div>
          {mapsUrl.trim() && <div className="kv"><span className="muted">Google Maps</span><b>Link anexado</b></div>}
          <div className="kv"><span className="muted">Passa por ali</span><b>{passes ? 'Sim' : 'Não informado'}</b></div>
          <p className="small muted">Seu nome não vai para o dossiê. Você pode relatar sem conta; com conta, acompanha as respostas.</p>
        </div>
      )}

      {erro && <p className="error" role="alert">{erro}</p>}
      <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {step > 0 && <button className="btn sec" type="button" onClick={() => setStep(step - 1)}>Voltar</button>}
        <button className="btn" type="submit" disabled={sending || recording}>{step === 0 ? <>Continuar: onde fica<Icon name="arrow" /></> : step === 1 ? <>Continuar: revisar<Icon name="arrow" /></> : sending ? 'Enviando…' : <><Icon name="send" />Enviar relato</>}</button>
      </div>
    </form>
  )
}
