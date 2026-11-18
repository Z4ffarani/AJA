// Escolhe a mesma voz feminina em português do Brasil em todos os aparelhos, quando existir:
// Google (Chrome no computador e Android) > Microsoft Francisca/Thalita (Edge) > Luciana (Apple) > qualquer pt-BR.
const PREFER = [/google.*portugu[eê]s do brasil/i, /google/i, /francisca/i, /thalita/i, /luciana/i, /maria/i]

function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const now = synth.getVoices()
  if (now.length) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => { synth.removeEventListener('voiceschanged', done); resolve(synth.getVoices()) }
    synth.addEventListener('voiceschanged', done)
    setTimeout(done, 1500)
  })
}

export async function pickVoice(synth: SpeechSynthesis) {
  const voices = await loadVoices(synth)
  const br = voices.filter((v) => v.lang?.replace('_', '-').toLowerCase() === 'pt-br')
  for (const re of PREFER) { const v = br.find((x) => re.test(x.name)); if (v) return v }
  return br[0] ?? voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ?? null
}

export async function speak(text: string, handlers: { onend?: () => void } = {}) {
  const synth = window.speechSynthesis
  if (!synth) return false
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'pt-BR'
  u.rate = 1
  const voice = await pickVoice(synth)
  if (voice) u.voice = voice
  u.onend = () => handlers.onend?.()
  u.onerror = () => handlers.onend?.()
  synth.speak(u)
  return true
}
