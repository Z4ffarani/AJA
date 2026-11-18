// Cena 3D conceitual da esquina da Rua Major Júlio Valente: calçadas com guia rebaixada,
// faixa de pedestres, piso tátil direcional e de alerta em relevo, semáforo de pedestres
// com botoeira sonora e contagem regressiva. Tudo gerado por código (sem modelos externos).
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type Mode = 'hoje' | 'proposta'
export type SceneApi = {
  setMode: (m: Mode) => void
  rotate: (deg: number) => void
  zoom: (factor: number) => void
  tilt: (deg: number) => void
  reset: () => void
  dispose: () => void
}

const H = 0.15 // altura da calçada
const ROAD = 3.5 // meia largura da rua
const WALK = 4 // largura da calçada
const RAMP_X = 1.6 // meia largura da guia rebaixada (com abas)
const RAMP_D = 1.2 // profundidade da rampa
const TILE = 0.25

// ── Texturas geradas em canvas ──
function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}
function rnd(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}
function speckle(g: CanvasRenderingContext2D, w: number, h: number, n: number, colors: string[], r: () => number, size = 2) {
  for (let i = 0; i < n; i++) { g.fillStyle = colors[Math.floor(r() * colors.length)]; g.fillRect(r() * w, r() * h, size * r() + 0.6, size * r() + 0.6) }
}

function asphaltTex() {
  const r = rnd(7)
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#3b3e43'; g.fillRect(0, 0, w, h)
    speckle(g, w, h, 26000, ['#2c2f33', '#46494e', '#52555a', '#34373b', '#5d5f63'], r, 2.2)
    g.globalAlpha = 0.08
    for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? '#222' : '#666'; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 60, 10 + r() * 40, r() * 3, 0, 7); g.fill() }
    g.globalAlpha = 1
  })
}
// Calçada de concreto em placas de 0,5 m (a textura cobre 2 m × 2 m)
function paverTex() {
  const r = rnd(11)
  return canvasTexture(1024, 1024, (g, w, h) => {
    const n = 4, s = w / n
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 176 + Math.floor(r() * 18)
      g.fillStyle = `rgb(${v},${v - 3},${v - 9})`; g.fillRect(i * s, j * s, s, s)
    }
    speckle(g, w, h, 30000, ['rgba(90,88,82,.35)', 'rgba(230,228,220,.35)', 'rgba(120,118,110,.3)'], r, 2)
    g.globalAlpha = 0.12
    for (let i = 0; i < 25; i++) { g.fillStyle = '#5a5850'; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 50, 6 + r() * 30, r() * 3, 0, 7); g.fill() }
    g.globalAlpha = 1
    g.strokeStyle = '#7b786f'; g.lineWidth = 5
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke() }
  })
}
function plasterTex(base: string, seed: number) {
  const r = rnd(seed)
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h)
    speckle(g, w, h, 16000, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.08)'], r, 3)
    g.globalAlpha = 0.07; g.fillStyle = '#3a2f22'
    for (let x = 0; x < w; x += 3) g.fillRect(x, h - 40 - r() * 40, 3, 80) // marca de chuva na base
    g.globalAlpha = 1
  })
}
function facadeTex(wall: string, seed: number, wide: boolean) {
  const r = rnd(seed)
  return canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = wall; g.fillRect(0, 0, w, h)
    speckle(g, w, h, 20000, ['rgba(0,0,0,.05)', 'rgba(255,255,255,.07)'], r, 3)
    const win = (x: number, y: number, ww: number, hh: number) => {
      g.fillStyle = '#e9e6df'; g.fillRect(x - 8, y - 8, ww + 16, hh + 16)
      const gr = g.createLinearGradient(x, y, x + ww, y + hh); gr.addColorStop(0, '#5f7385'); gr.addColorStop(1, '#22303b')
      g.fillStyle = gr; g.fillRect(x, y, ww, hh)
      g.strokeStyle = '#cfcac0'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + hh); g.stroke()
    }
    // térreo: portão e janela; andar de cima: janelas
    g.fillStyle = '#4a4f55'; g.fillRect(w * 0.08, h * 0.55, w * 0.26, h * 0.45)
    g.strokeStyle = '#2c3035'; g.lineWidth = 4
    for (let x = w * 0.08; x < w * 0.34; x += 14) { g.beginPath(); g.moveTo(x, h * 0.55); g.lineTo(x, h); g.stroke() }
    win(w * 0.5, h * 0.6, w * 0.16, h * 0.2)
    if (wide) win(w * 0.75, h * 0.6, w * 0.14, h * 0.2)
    win(w * 0.12, h * 0.12, w * 0.16, h * 0.2); win(w * 0.5, h * 0.12, w * 0.16, h * 0.2)
    if (wide) win(w * 0.75, h * 0.12, w * 0.14, h * 0.2)
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h * 0.46, w, 10) // laje
  })
}
// Foco de pedestres: boneco vermelho parado (apagado) e verde andando (aceso)
function pedHeadTex() {
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = '#111316'; g.fillRect(0, 0, w, h)
    const lens = (cy: number, color: string, glow: number, walking: boolean) => {
      g.fillStyle = '#050607'; g.beginPath(); g.arc(w / 2, cy, 104, 0, 7); g.fill()
      g.save(); g.shadowColor = color; g.shadowBlur = glow; g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round'
      g.beginPath(); g.arc(w / 2, cy - 62, 16, 0, 7); g.fill()
      g.lineWidth = 22
      if (walking) {
        g.beginPath(); g.moveTo(w / 2, cy - 38); g.lineTo(w / 2 - 4, cy + 16); g.stroke()
        g.beginPath(); g.moveTo(w / 2 - 4, cy + 16); g.lineTo(w / 2 - 30, cy + 66); g.stroke()
        g.beginPath(); g.moveTo(w / 2 - 4, cy + 16); g.lineTo(w / 2 + 26, cy + 64); g.stroke()
        g.lineWidth = 16
        g.beginPath(); g.moveTo(w / 2, cy - 28); g.lineTo(w / 2 + 30, cy + 4); g.stroke()
        g.beginPath(); g.moveTo(w / 2, cy - 28); g.lineTo(w / 2 - 30, cy - 2); g.stroke()
      } else {
        g.fillRect(w / 2 - 22, cy - 40, 44, 62)
        g.fillRect(w / 2 - 20, cy + 20, 16, 50); g.fillRect(w / 2 + 4, cy + 20, 16, 50)
      }
      g.restore()
    }
    lens(130, '#5a1a14', 0, false)
    lens(382, '#7dffb0', 40, true)
  })
}
function countdownTex(n: string) {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#0b0c0e'; g.fillRect(0, 0, w, h)
    g.font = 'bold 170px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillStyle = '#2a1606'; g.fillText('88', w / 2, h / 2 + 6)
    g.save(); g.shadowColor = '#ff9a1f'; g.shadowBlur = 24; g.fillStyle = '#ffae3d'; g.fillText(n, w / 2, h / 2 + 6); g.restore()
  })
}
function buttonBoxTex() {
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h - 30, w, 30)
    g.fillStyle = '#1b1d20'; g.beginPath(); g.arc(w / 2, h * 0.36, 66, 0, 7); g.fill()
    g.fillStyle = '#3a3e44'; g.beginPath(); g.arc(w / 2, h * 0.36, 48, 0, 7); g.fill()
    // seta tátil indicando a direção da travessia
    g.fillStyle = '#1b1d20'; g.beginPath(); g.moveTo(w * 0.25, h * 0.66); g.lineTo(w * 0.7, h * 0.66); g.lineTo(w * 0.7, h * 0.6); g.lineTo(w * 0.82, h * 0.7); g.lineTo(w * 0.7, h * 0.8); g.lineTo(w * 0.7, h * 0.74); g.lineTo(w * 0.25, h * 0.74); g.fill()
    // alto-falante
    g.fillRect(w * 0.3, h * 0.86, 20, 26); g.beginPath(); g.moveTo(w * 0.3 + 20, h * 0.86); g.lineTo(w * 0.3 + 44, h * 0.84); g.lineTo(w * 0.3 + 44, h * 0.84 + 48); g.lineTo(w * 0.3 + 20, h * 0.86 + 26); g.fill()
    g.strokeStyle = '#1b1d20'; g.lineWidth = 6
    for (const rr of [18, 32]) { g.beginPath(); g.arc(w * 0.3 + 50, h * 0.86 + 13, rr, -0.8, 0.8); g.stroke() }
  })
}
function markerTex(label: string, bg: string) {
  return canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(w / 2 + 2, h / 2 + 4, 52, 0, 7); g.fill()
    g.fillStyle = bg; g.beginPath(); g.arc(w / 2, h / 2, 52, 0, 7); g.fill()
    g.lineWidth = 8; g.strokeStyle = '#fff'; g.stroke()
    g.fillStyle = '#fff'; g.font = 'bold 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, h / 2 + 3)
  })
}
function skyTex() {
  return canvasTexture(16, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fb2e6'); gr.addColorStop(0.55, '#c9def0'); gr.addColorStop(1, '#eef3f6')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
  })
}

// UV planar em metros (para texturas que repetem pelo mundo)
function planarUV(geo: THREE.BufferGeometry, size: number) {
  const p = geo.attributes.position
  const uv = new Float32Array(p.count * 2)
  for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / size; uv[i * 2 + 1] = p.getZ(i) / size }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}
function boxAt(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0)
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
  return g
}

// Altura e inclinação da superfície da calçada (considera as rampas)
function surface(x: number, z: number): { y: number; tilt: number } {
  const az = Math.abs(z)
  if (az < ROAD) return { y: 0, tilt: 0 }
  if (Math.abs(x) < RAMP_X && az < ROAD + RAMP_D) {
    const t = (az - ROAD) / RAMP_D
    const slope = Math.atan((H - 0.01) / RAMP_D)
    return { y: 0.01 + t * (H - 0.01), tilt: z > 0 ? -slope : slope }
  }
  return { y: H, tilt: 0 }
}

type Tile = { x: number; z: number; kind: 'x' | 'z' | 'alerta' }
function tilesAlong(axis: 'x' | 'z', fixed: number[], from: number, to: number): Tile[] {
  const out: Tile[] = []
  const step = from < to ? TILE : -TILE
  for (let v = from + step / 2; step > 0 ? v < to : v > to; v += step)
    for (const f of fixed) out.push(axis === 'x' ? { x: v, z: f, kind: 'x' } : { x: f, z: v, kind: 'z' })
  return out
}
function alertBlock(xs: [number, number], zs: [number, number]): Tile[] {
  const out: Tile[] = []
  for (let x = xs[0] + TILE / 2; x < xs[1]; x += TILE) for (let z = zs[0] + TILE / 2; z < zs[1]; z += TILE) out.push({ x, z, kind: 'alerta' })
  return out
}

function buildTiles(tiles: Tile[], mats: { base: THREE.Material; relief: THREE.Material }) {
  const group = new THREE.Group()
  const baseGeo = new THREE.BoxGeometry(TILE - 0.006, 0.012, TILE - 0.006); baseGeo.translate(0, 0.006, 0)
  const barGeo = new THREE.BoxGeometry(0.215, 0.007, 0.032); barGeo.translate(0, 0.012 + 0.0035, 0)
  const domeGeo = new THREE.CylinderGeometry(0.011, 0.0145, 0.007, 14); domeGeo.translate(0, 0.012 + 0.0035, 0)
  const bars = tiles.filter((t) => t.kind !== 'alerta').length * 4
  const domes = tiles.filter((t) => t.kind === 'alerta').length * 36
  const base = new THREE.InstancedMesh(baseGeo, mats.base, tiles.length)
  const bar = new THREE.InstancedMesh(barGeo, mats.relief, Math.max(bars, 1))
  const dome = new THREE.InstancedMesh(domeGeo, mats.relief, Math.max(domes, 1))
  bar.count = bars; dome.count = domes
  const m = new THREE.Matrix4(), local = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler()
  let bi = 0, di = 0
  tiles.forEach((t, i) => {
    const s = surface(t.x, t.z)
    e.set(s.tilt, t.kind === 'z' ? Math.PI / 2 : 0, 0, 'XYZ'); q.setFromEuler(e)
    m.compose(new THREE.Vector3(t.x, s.y, t.z), q, new THREE.Vector3(1, 1, 1))
    base.setMatrixAt(i, m)
    if (t.kind === 'alerta') {
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) { local.makeTranslation(-0.1 + a * 0.04, 0, -0.1 + b * 0.04); dome.setMatrixAt(di++, m.clone().multiply(local)) }
    } else {
      for (const off of [-0.085, -0.028, 0.028, 0.085]) { local.makeTranslation(0, 0, off); bar.setMatrixAt(bi++, m.clone().multiply(local)) }
    }
  })
  for (const im of [base, bar, dome]) { im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; group.add(im) }
  return group
}

export function createConceptScene(container: HTMLElement, opts: { reducedMotion: boolean; onReady?: () => void }): SceneApi {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = skyTex()
  scene.fog = new THREE.Fog(0xdde8f0, 28, 60)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.45

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200)
  const HOME = { pos: new THREE.Vector3(8.2, 9.6, 11.2), target: new THREE.Vector3(-1.4, 0, 1.6) }
  let far = 1 // telas estreitas começam um pouco mais longe para caber a esquina toda
  const homePos = () => HOME.target.clone().add(HOME.pos.clone().sub(HOME.target).multiplyScalar(far))
  camera.position.copy(HOME.pos)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(HOME.target)
  controls.enableDamping = !opts.reducedMotion
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.minDistance = 2.2
  controls.maxDistance = 26
  controls.maxPolarAngle = 1.42
  controls.update()

  // Luz: sol de fim de manhã + céu
  scene.add(new THREE.HemisphereLight(0xd8e8ff, 0x8a7f6a, 0.9))
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6)
  sun.position.set(9, 14, 7)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  scene.add(sun)

  const aniso = renderer.capabilities.getMaxAnisotropy()
  const tex = (t: THREE.Texture, rep = 1) => { t.anisotropy = aniso; t.repeat.set(rep, rep); return t }
  const mat = {
    asphalt: new THREE.MeshStandardMaterial({ map: tex(asphaltTex()), roughness: 0.95 }),
    walk: new THREE.MeshStandardMaterial({ map: tex(paverTex()), roughness: 0.9 }),
    curb: new THREE.MeshStandardMaterial({ color: 0x9c9b96, roughness: 0.8 }),
    paint: new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.7 }),
    yellowPaint: new THREE.MeshStandardMaterial({ color: 0xf0c419, roughness: 0.7 }),
    tactile: new THREE.MeshStandardMaterial({ color: 0xf2bf00, roughness: 0.55 }),
    tactileOld: new THREE.MeshStandardMaterial({ color: 0xb8952a, roughness: 0.8 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x5b6168, metalness: 0.65, roughness: 0.38 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x1d2024, metalness: 0.4, roughness: 0.5 }),
    ground: new THREE.MeshStandardMaterial({ color: 0x8c8a80, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 0.95 }),
    leaves: new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 0.85 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x5c4b3b, roughness: 1 }),
  }

  const common = new THREE.Group(); scene.add(common)
  const add = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], parent: THREE.Object3D = common, shadows = true) => {
    const mesh = new THREE.Mesh(g, m); mesh.castShadow = shadows; mesh.receiveShadow = true; parent.add(mesh); return mesh
  }

  // Chão em volta, asfalto e faixa
  add(boxAt(-40, 40, -0.06, -0.02, -40, 40), mat.ground, common, false)
  add(planarUV(boxAt(-30, 30, -0.02, 0, -ROAD, ROAD), 4), mat.asphalt, common, false)
  for (let z = -ROAD + 0.35; z < ROAD - 0.3; z += 0.8) add(boxAt(-2, 2, 0, 0.004, z, z + 0.4), mat.paint, common, false)
  for (let x = -30; x < 30; x += 4) if (x + 2 < -2.6 || x > 2.6) add(boxAt(x, x + 2, 0, 0.003, -0.06, 0.06), mat.yellowPaint, common, false)
  add(boxAt(-2.9, -2.6, 0, 0.004, -ROAD + 0.2, -0.1), mat.paint, common, false) // linha de retenção
  add(boxAt(2.6, 2.9, 0, 0.004, 0.1, ROAD - 0.2), mat.paint, common, false)

  // Calçadas com guia rebaixada em frente à faixa
  for (const side of [1, -1]) {
    const zIn = side * ROAD, zOut = side * (ROAD + WALK), zRamp = side * (ROAD + RAMP_D)
    const z0 = Math.min(zIn, zOut), z1 = Math.max(zIn, zOut)
    add(planarUV(boxAt(-30, -RAMP_X, 0, H, z0, z1), 2), mat.walk)
    add(planarUV(boxAt(RAMP_X, 30, 0, H, z0, z1), 2), mat.walk)
    add(planarUV(boxAt(-RAMP_X, RAMP_X, 0, H, Math.min(zRamp, zOut), Math.max(zRamp, zOut)), 2), mat.walk)
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(RAMP_D, 0), new THREE.Vector2(RAMP_D, H), new THREE.Vector2(0, 0.01)])
    const ramp = new THREE.ExtrudeGeometry(shape, { depth: RAMP_X * 2, bevelEnabled: false })
    ramp.rotateY(side > 0 ? -Math.PI / 2 : Math.PI / 2)
    ramp.translate(side > 0 ? RAMP_X : -RAMP_X, 0, zIn)
    add(planarUV(ramp, 2), mat.walk)
    // meio-fio de granito (fora da rampa)
    const c0 = Math.min(zIn, zIn + side * 0.14), c1 = Math.max(zIn, zIn + side * 0.14)
    add(boxAt(-30, -RAMP_X, 0, H + 0.004, c0, c1), mat.curb)
    add(boxAt(RAMP_X, 30, 0, H + 0.004, c0, c1), mat.curb)
  }

  // Muro e casas
  const walls = ['#e7dcc6', '#d9c7a8', '#cfd8d3']
  for (const side of [1, -1]) {
    const fence: [number, number][] = []
    let fenceZ = 0
    const zw = side * (ROAD + WALK)
    let x = -24, k = side > 0 ? 0 : 5
    while (x < 24) {
      const w = 6 + ((k * 37) % 4)
      const color = ['#e6d3b3', '#c9d6dc', '#e8c7b5', '#d7dcc4', '#efe6d6', '#c8c2b8'][k % 6]
      const hgt = 5.6 + ((k * 13) % 3) * 0.6
      const zFront = zw + side * 2.5
      const faceIdx = side > 0 ? 5 : 4
      const plain = new THREE.MeshStandardMaterial({ map: tex(plasterTex(color, 30 + k)), roughness: 0.92 })
      const front = new THREE.MeshStandardMaterial({ map: tex(facadeTex(color, 50 + k, w > 7)), roughness: 0.85 })
      const mats = [plain, plain, plain, plain, plain, plain]; mats[faceIdx] = front
      add(boxAt(x + 0.1, x + w - 0.1, 0, hgt, Math.min(zFront, zFront + side * 8), Math.max(zFront, zFront + side * 8)), mats)
      // muro com portão
      const wallMat = new THREE.MeshStandardMaterial({ map: tex(plasterTex(walls[k % 3], 70 + k)), roughness: 0.95 })
      const zA = Math.min(zw, zw + side * 0.18), zB = Math.max(zw, zw + side * 0.18)
      // mureta baixa com gradil (deixa ver a calçada) e portão
      add(boxAt(x, x + w * 0.62, H, H + 0.8, zA, zB), wallMat)
      add(boxAt(x + w * 0.62, x + w * 0.95, H, H + 1.9, zA + side * 0.05, zB), mat.darkMetal)
      add(boxAt(x + w * 0.95, x + w, H, H + 0.8, zA, zB), wallMat)
      fence.push([x, x + w * 0.62], [x + w * 0.95, x + w])
      fenceZ = (zA + zB) / 2
      x += w; k++
    }
    const bars: [number, number][] = []
    for (const [a, b] of fence) {
      for (let bx = a + 0.06; bx < b; bx += 0.12) bars.push([bx, fenceZ])
      add(boxAt(a, b, H + 1.78, H + 1.84, fenceZ - 0.03, fenceZ + 0.03), mat.darkMetal)
      add(boxAt(a, b, H + 0.8, H + 0.86, fenceZ - 0.03, fenceZ + 0.03), mat.darkMetal)
    }
    const barGeo = new THREE.BoxGeometry(0.018, 0.98, 0.018); barGeo.translate(0, H + 0.8 + 0.49, 0)
    const im = new THREE.InstancedMesh(barGeo, mat.darkMetal, bars.length)
    bars.forEach(([bx, bz], i) => im.setMatrixAt(i, new THREE.Matrix4().makeTranslation(bx, 0, bz)))
    im.castShadow = true; im.receiveShadow = true; common.add(im)
  }

  // Árvore com canteiro e poste de luz
  {
    const tx = -6.5, tz = -(ROAD + 1.0)
    add(boxAt(tx - 0.6, tx + 0.6, H - 0.02, H + 0.005, tz - 0.6, tz + 0.6), mat.soil, common, false)
    const trunk = new THREE.CylinderGeometry(0.11, 0.16, 3.2, 10); trunk.translate(tx, H + 1.6, tz); add(trunk, mat.bark)
    const r = rnd(5)
    for (let i = 0; i < 9; i++) {
      const s = 0.9 + r() * 0.8
      const ball = new THREE.IcosahedronGeometry(s, 2); ball.translate(tx + (r() - 0.5) * 2, H + 3.4 + r() * 1.4, tz + (r() - 0.5) * 2)
      add(ball, mat.leaves)
    }
    const lx = 7, lz = ROAD + 0.45
    const pole = new THREE.CylinderGeometry(0.07, 0.1, 7, 10); pole.translate(lx, H + 3.5, lz); add(pole, mat.metal)
    add(boxAt(lx - 0.05, lx + 0.05, H + 6.8, H + 6.9, lz - 1.6, lz), mat.metal)
    add(boxAt(lx - 0.18, lx + 0.18, H + 6.62, H + 6.82, lz - 2.1, lz - 1.4), mat.darkMetal)
  }

  // Postes de semáforo de pedestres (um em cada lado da faixa)
  const featProp = new THREE.Group(); scene.add(featProp)
  const featToday = new THREE.Group(); scene.add(featToday)
  const headTex = tex(pedHeadTex())
  const headMat = [mat.darkMetal, mat.darkMetal, mat.darkMetal, mat.darkMetal,
    new THREE.MeshStandardMaterial({ map: headTex, emissiveMap: headTex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.4 }), mat.darkMetal]
  const cdTex = tex(countdownTex('12'))
  const cdMat = [mat.darkMetal, mat.darkMetal, mat.darkMetal, mat.darkMetal, new THREE.MeshStandardMaterial({ map: cdTex, emissiveMap: cdTex, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.4 }), mat.darkMetal]
  const btnTex = tex(buttonBoxTex())
  const btnMat = [new THREE.MeshStandardMaterial({ map: btnTex, roughness: 0.55 }), mat.yellowPaint, mat.yellowPaint, mat.yellowPaint, mat.yellowPaint, mat.yellowPaint]
  for (const side of [1, -1]) {
    const px = -2.05, pz = side * (ROAD + 0.35)
    const pole = new THREE.CylinderGeometry(0.055, 0.065, 3.1, 12); pole.translate(px, H + 1.55, pz); add(pole, mat.metal)
    // foco de pedestres virado para o outro lado da rua
    const head = new THREE.BoxGeometry(0.3, 0.6, 0.2); head.translate(0, 0, 0)
    const hm = new THREE.Mesh(head, headMat); hm.position.set(px, H + 2.75, pz - side * 0.16); hm.rotation.y = side > 0 ? Math.PI : 0; hm.castShadow = true; common.add(hm)
    // contagem regressiva ao lado do foco (proposta)
    const cd = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.16), cdMat); cd.position.set(px + (side > 0 ? -0.32 : 0.32), H + 2.6, pz - side * 0.16); cd.rotation.y = side > 0 ? Math.PI : 0; cd.castShadow = true; featProp.add(cd)
    // botoeira sonora virada para a rampa (proposta)
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.13), btnMat); box.position.set(px + 0.1, H + 1.0, pz); box.castShadow = true; featProp.add(box)
  }

  // Piso tátil
  const near = ROAD + WALK - 1.1 // eixo do direcional, acompanhando o muro (lado de cá)
  const rows = (c: number) => [c - TILE / 2, c + TILE / 2]
  const proposta: Tile[] = [
    ...tilesAlong('x', rows(near), -16, -0.25),
    ...alertBlock([-0.25, 0.25], [near - 0.25, near + 0.25]),
    ...tilesAlong('z', [-0.125, 0.125], near - 0.25, ROAD + 0.6),
    ...alertBlock([-1, 1], [ROAD + 0.1, ROAD + 0.6]),
    ...alertBlock([-1, 1], [-ROAD - 0.6, -ROAD - 0.1]),
    ...tilesAlong('z', [-0.125, 0.125], -ROAD - 0.6, -near + 0.25),
    ...alertBlock([-0.25, 0.25], [-near - 0.25, -near + 0.25]),
    ...tilesAlong('x', rows(-near), 0.25, 16),
  ]
  const hoje: Tile[] = tilesAlong('x', rows(near), -16, -3)
  featProp.add(buildTiles(proposta, { base: mat.tactile, relief: mat.tactile }))
  featToday.add(buildTiles(hoje, { base: mat.tactileOld, relief: mat.tactileOld }))

  // Marcadores numerados (mesma numeração da legenda)
  const marker = (label: string, bg: string, pos: [number, number, number], parent: THREE.Object3D) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerTex(label, bg), depthTest: false, transparent: true, sizeAttenuation: false }))
    s.position.set(...pos); s.scale.set(0.055, 0.055, 1); s.renderOrder = 10; parent.add(s)
  }
  marker('1', '#1D5BD8', [-6, 0.75, near], featProp)
  marker('2', '#1D5BD8', [1.3, 0.7, ROAD + 0.35], featProp)
  marker('3', '#1D5BD8', [-1.9, H + 1.45, ROAD + 0.35], featProp)
  marker('4', '#1D5BD8', [-1.73, H + 3.0, -ROAD - 0.5], featProp)
  marker('!', '#B42318', [-3.1, 0.75, near], featToday)
  marker('?', '#B42318', [0, 0.7, ROAD + 0.4], featToday)

  let mode: Mode = 'proposta'
  const applyMode = () => { featProp.visible = mode === 'proposta'; featToday.visible = mode === 'hoje' }
  applyMode()

  // Render sob demanda
  let dirty = true, visible = true
  controls.addEventListener('change', () => { dirty = true })
  let first = true
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'
    const wasFar = far
    camera.aspect = w / h
    camera.fov = w / h < 1.2 ? 46 : 38
    far = w / h < 1.2 ? 1.1 : 1
    if (first && far !== wasFar) { camera.position.copy(homePos()); controls.update() }
    camera.updateProjectionMatrix(); dirty = true
  }
  const ro = new ResizeObserver(resize); ro.observe(container); resize()
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(container)
  renderer.setAnimationLoop(() => {
    if (!visible) return
    controls.update()
    if (!dirty) return
    dirty = false
    renderer.render(scene, camera)
    if (first) { first = false; opts.onReady?.() }
  })

  const sph = new THREE.Spherical()
  const orbit = (fn: (s: THREE.Spherical) => void) => {
    const off = camera.position.clone().sub(controls.target)
    sph.setFromVector3(off); fn(sph)
    sph.radius = THREE.MathUtils.clamp(sph.radius, controls.minDistance, controls.maxDistance)
    sph.phi = THREE.MathUtils.clamp(sph.phi, 0.15, controls.maxPolarAngle)
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph))
    controls.update(); dirty = true
  }

  return {
    setMode: (m) => { mode = m; applyMode(); dirty = true },
    rotate: (deg) => orbit((s) => { s.theta += THREE.MathUtils.degToRad(deg) }),
    tilt: (deg) => orbit((s) => { s.phi += THREE.MathUtils.degToRad(deg) }),
    zoom: (f) => orbit((s) => { s.radius *= f }),
    reset: () => { camera.position.copy(homePos()); controls.target.copy(HOME.target); controls.update(); dirty = true },
    dispose: () => {
      renderer.setAnimationLoop(null); ro.disconnect(); io.disconnect(); controls.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const ms = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : []
        ms.forEach((x) => { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose() })
      })
      pmrem.dispose(); renderer.dispose(); renderer.domElement.remove()
    },
  }
}
