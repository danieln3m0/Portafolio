import * as THREE from 'three'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { ProjectModel } from '@/data/portfolio'
import type { View } from '@/lib/cluster'
import { buildSupershapeData, type SupershapeParams } from '@/lib/supershape'
import { buildProjectModel, makeMaterial, PALETTE, PROJECT_THEMES, type ModelDef } from './models'

/**
 * Escena 3D de fondo. Metaballs líquidos (MarchingCubes) con material
 * perlado iridiscente que:
 *  - en reposo se ondulan en las esquinas y se pasan gotas (lámpara de lava);
 *  - se estiran hacia el cursor y se apartan con una onda al hacer clic;
 *  - al pasar sobre el nombre se reúnen y se erizan en púas de ferrofluido;
 *  - en "proyectos" y "tu-forma" se reúnen, se absorben y MATERIALIZAN el
 *    modelo 3D del proyecto activo o la supershape del visitante.
 * Loop de rAF fuera de React. Honra prefers-reduced-motion (escena estática).
 */

export type ClusterDetail = { active: boolean; x?: number; y?: number; w?: number; h?: number }

export type SceneController = {
  setView: (view: View, project: number) => void
  setProject: (project: number) => void
  setCluster: (detail: ClusterDetail) => void
  setSupershape: (params: SupershapeParams) => void
  snapshot: () => string | null
  dispose: () => void
}

// Anclas relativas (fracción de viewport) para enmarcar el centro sin taparlo.
const ANCHORS = [
  { x: 0.13, y: 0.24, r: 0.15, e: 1.25 },
  { x: 0.87, y: 0.2, r: 0.13, e: 1.2 },
  { x: 0.18, y: 0.8, r: 0.16, e: 1.3 },
  { x: 0.84, y: 0.82, r: 0.14, e: 1.2 },
  { x: 0.98, y: 0.5, r: 0.12, e: 1.15 },
]
// Gotas que viajan entre figuras vecinas.
const DROPS = [
  { from: 0, to: 2, off: 0 },
  { from: 1, to: 4, off: 2.4 },
  { from: 3, to: 4, off: 4.1 },
]
const SUB = 12
const SPIKES = 12
const MOBILE = 768 // breakpoint md de Tailwind

type Model = { holder: THREE.Group; rot: [number, number]; update: (t: number) => void; vis: number; target: number }

const smooth = (x: number) => x * x * (3 - 2 * x)
const easeOutBack = (x: number) => 1 + 2.5 * (x - 1) ** 3 + 1.5 * (x - 1) ** 2

// Centra el grupo y lo escala para que su dimensión mayor mida 2.
function normalize(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group)
  const c = box.getCenter(new THREE.Vector3())
  const s = box.getSize(new THREE.Vector3())
  group.position.sub(c)
  const wrap = new THREE.Group()
  wrap.add(group)
  wrap.scale.setScalar(2 / (Math.max(s.x, s.y, s.z) || 1))
  return wrap
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const target = pmrem.fromScene(room, 0.04)
  room.dispose()
  pmrem.dispose()
  return target
}

export function createScene(
  canvas: HTMLCanvasElement,
  veil: HTMLElement | null,
  kinds: ProjectModel[],
  onLost: () => void,
): SceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: window.innerWidth >= MOBILE, alpha: true })
  try {
    return buildScene(renderer, canvas, veil, kinds, onLost)
  } catch (err) {
    // Fallo a medio construir (p. ej. sin memoria de GPU): libera el contexto.
    renderer.dispose()
    throw err
  }
}

function buildScene(
  renderer: THREE.WebGLRenderer,
  canvas: HTMLCanvasElement,
  veil: HTMLElement | null,
  kinds: ProjectModel[],
  onLost: () => void,
): SceneController {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lerpK = (k: number) => (reduce ? 1 : k)

  // ---------- Renderer, cámara y luz ----------
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  const scene = new THREE.Scene()
  const env = makeEnvironment(renderer)
  scene.environment = env.texture
  const key = new THREE.DirectionalLight(0xffffff, 1.3)
  key.position.set(4, 6, 8)
  scene.add(key)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 12)

  // ---------- Pantalla ↔ mundo (plano z = 0) ----------
  let vw = 1
  let vh = 1
  let W = 1
  let H = 1
  let L = 1
  const toWorld = (sx: number, sy: number, out = new THREE.Vector3()) =>
    out.set((sx / vw - 0.5) * W, -(sy / vh - 0.5) * H, 0)
  // Dónde se materializa el modelo: columna derecha en escritorio, arriba en móvil.
  const layout = { c: new THREE.Vector3(), size: 1 }
  function updateLayout() {
    if (vw < MOBILE) {
      const box = Math.min(vw * 0.6, vh * 0.27)
      toWorld(vw / 2, 64 + vh * 0.17, layout.c)
      layout.size = (box / vh) * H
    } else {
      const box = Math.min(vw * 0.34, vh * 0.52)
      toWorld(vw * 0.73, vh * 0.52, layout.c)
      layout.size = (box / vh) * H
    }
  }

  // ---------- Metaballs ----------
  const goo = new MarchingCubes(
    window.innerWidth < MOBILE ? 40 : 56,
    makeMaterial(0xffffff, { vertexColors: true, roughness: 0.2 }),
    false,
    true,
    60000,
  )
  goo.isolation = 80
  scene.add(goo)
  // Fuerza para que la isosuperficie de una bola aislada tenga ese radio (en mundo).
  const strengthFor = (radius: number) => {
    const rho = radius / (2 * L)
    return rho * rho * (goo.isolation + SUB)
  }
  const addBall = (p: THREE.Vector3, strength: number, color: THREE.Color) => {
    if (strength > 1e-6) goo.addBall((p.x / L + 1) / 2, (p.y / L + 1) / 2, (p.z / L + 1) / 2, strength, SUB, color)
  }
  // El borde del campo atenúa el color de vértice: se amplifica un poco.
  const bright = (hex: string) => new THREE.Color(hex).multiplyScalar(1.3)
  const balls = ANCHORS.flatMap((_, i) =>
    [0, 1, 2].map((k) => ({
      a: i,
      ang: k * 2.1 + Math.random(),
      dist: 0.3 + Math.random() * 0.25,
      size: 0.6 + Math.random() * 0.16,
      spin: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      col: bright(PALETTE[i % PALETTE.length][k % 2]),
    })),
  )
  const spikeCols = PALETTE.map(([c]) => bright(c))
  // Desplazamiento elástico por ancla (onda al hacer clic).
  const offs = ANCHORS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))

  // ---------- Modelos ----------
  const makeModel = (def: ModelDef): Model => {
    const holder = new THREE.Group()
    holder.add(normalize(def.group))
    holder.visible = false
    scene.add(holder)
    return { holder, rot: def.rot, update: def.update, vis: 0, target: 0 }
  }
  const projectModels = kinds.map((k) => makeModel(buildProjectModel(k)))

  const superMat = makeMaterial(0xffffff, { vertexColors: true, roughness: 0.22, side: THREE.DoubleSide, iridescence: 1 })
  const superMesh = new THREE.Mesh(new THREE.BufferGeometry(), superMat)
  const superHolder = new THREE.Group()
  superHolder.add(superMesh)
  superHolder.visible = false
  scene.add(superHolder)
  const superModel: Model = {
    holder: superHolder,
    rot: [0.45, -0.6],
    update: (t) => (superMesh.rotation.y = t * 0.25),
    vis: 0,
    target: 0,
  }
  const allModels = [...projectModels, superModel]

  let superKey = ''
  function buildSuper(P: SupershapeParams) {
    const k = JSON.stringify(P)
    if (k === superKey) return
    superKey = k
    const data = buildSupershapeData(P)
    const cA = new THREE.Color(PALETTE[P.pal % PALETTE.length][0])
    const cB = new THREE.Color(PROJECT_THEMES[P.theme % PROJECT_THEMES.length][1])
    const cC = new THREE.Color(PALETTE[(P.pal + 2) % PALETTE.length][1])
    const tmp = new THREE.Color()
    const colors = new Float32Array(data.heights.length * 3)
    for (let i = 0; i < data.heights.length; i++) {
      // Degradado vertical + vetas por lóbulo: hace legible cada pétalo.
      tmp.copy(cA).lerp(cB, data.heights[i]).lerp(cC, 0.5 + 0.3 * data.lobes[i])
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setIndex(new THREE.BufferAttribute(data.indices, 1))
    geo.computeVertexNormals()
    superMesh.geometry.dispose()
    superMesh.geometry = geo
  }

  // ---------- Estado ----------
  let view: View = 'inicio'
  let project = 0
  let activeKey = ''
  let gather = 0
  let pulse = 0
  let splashAmt = 0
  let veilAmt = 0
  let dirty = 3
  const splash = { active: false, x: 0, y: 0 }
  const pointer = { x: 0, y: 0, nx: 0, ny: 0, sx: 0, sy: 0, active: false }

  function refresh() {
    let model: Model | null = null
    let k = ''
    if (view === 'proyectos' && projectModels[project]) {
      model = projectModels[project]
      k = 'p' + project
    } else if (view === 'tu-forma' && superKey) {
      model = superModel
      k = 's' + superKey
    }
    // Cambiar de forma ya materializada: un chapoteo de líquido acompaña el cambio.
    if (model && activeKey && k !== activeKey && gather > 0.5) pulse = 1
    activeKey = k
    allModels.forEach((m) => (m.target = m === model ? 1 : 0))
    dirty = 3
  }

  // ---------- Medidas ----------
  function resize() {
    vw = window.innerWidth
    vh = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, vw < MOBILE ? 1 : 1.75))
    renderer.setSize(vw, vh, false)
    camera.aspect = vw / vh
    camera.updateProjectionMatrix()
    H = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    W = H * camera.aspect
    L = (Math.max(W, H) / 2) * 1.04
    goo.scale.set(L, L, L)
    updateLayout()
    dirty = 3
  }

  // ---------- Líquido ----------
  const base = new THREE.Vector3()
  const pos = new THREE.Vector3()
  const tmpA = new THREE.Vector3()
  const tmpB = new THREE.Vector3()

  function updateGoo(t: number) {
    const g = smooth(gather)
    const show = 1 - THREE.MathUtils.smoothstep(gather, 0.55, 1) + pulse * 0.7
    if (show < 0.01) {
      goo.visible = false
      return
    }
    goo.visible = true
    goo.reset()
    const min = Math.min(W, H)
    const sp = toWorld(splash.x, splash.y, tmpB)

    for (const b of balls) {
      const A = ANCHORS[b.a]
      const o = offs[b.a]
      toWorld(A.x * vw, A.y * vh, base)
      const ra = A.r * min
      const ang = b.ang + t * b.spin
      let x = base.x + o.x + Math.cos(ang) * b.dist * ra * A.e + Math.sin(t * 0.35 + b.phase) * ra * 0.1
      let y = base.y + o.y + Math.sin(ang) * b.dist * ra + Math.cos(t * 0.3 + b.phase) * ra * 0.1
      let r = b.size * ra
      if (g > 0) {
        // Se reúnen donde se materializa el modelo y crecen como un solo cuerpo.
        x += (layout.c.x + Math.cos(ang * 1.7) * layout.size * 0.22 - x) * g
        y += (layout.c.y + Math.sin(ang * 1.7) * layout.size * 0.22 - y) * g
        r = r * (1 - g) + layout.size * 0.2 * g
      }
      if (splashAmt > 0.001) {
        // Se reúnen y orbitan en un núcleo apretado sobre el nombre.
        const sa = (b.a / ANCHORS.length) * Math.PI * 2 + t * 0.3 + b.ang
        x += (sp.x + Math.cos(sa) * min * 0.05 - x) * splashAmt
        y += (sp.y + Math.sin(sa) * min * 0.05 - y) * splashAmt
        r *= 1 - 0.45 * splashAmt
      }
      addBall(pos.set(x, y, 0), strengthFor(r) * show, b.col)
    }

    const calm = (1 - g) * (1 - splashAmt)
    if (calm > 0.02) {
      for (const d of DROPS) {
        const A = ANCHORS[d.from]
        const B = ANCHORS[d.to]
        const k = 0.5 - 0.5 * Math.cos(t * 0.32 + d.off)
        toWorld(A.x * vw, A.y * vh, tmpA)
        toWorld(B.x * vw, B.y * vh, base)
        pos.set(tmpA.x + (base.x - tmpA.x) * k, tmpA.y + (base.y - tmpA.y) * k + Math.sin(k * Math.PI) * min * 0.04, 0)
        addBall(pos, strengthFor(min * 0.045) * calm * show, balls[d.from * 3].col)
      }
      // Tensión líquida: cerca del cursor, la masa más próxima se estira hacia él.
      if (pointer.active) {
        const p = toWorld(pointer.x, pointer.y, tmpA)
        let best = 0
        let bd = Infinity
        ANCHORS.forEach((A, i) => {
          const d = toWorld(A.x * vw, A.y * vh, base).distanceTo(p)
          if (d < bd) {
            bd = d
            best = i
          }
        })
        const A = ANCHORS[best]
        const k = Math.max(0, 1 - bd / (A.r * min * 2.3))
        if (k > 0.01) {
          toWorld(A.x * vw, A.y * vh, base)
          pos.copy(p).lerp(base, 0.3)
          addBall(pos, strengthFor(A.r * min * 0.42 * k) * calm, balls[best * 3].col)
        }
      }
    }

    // Corona de ferrofluido: núcleo + púas radiales que palpitan.
    if (splashAmt > 0.02) {
      const core = min * 0.075 * splashAmt
      addBall(pos.copy(sp), strengthFor(core), spikeCols[2])
      for (let s = 0; s < SPIKES; s++) {
        const ang = (s / SPIKES) * Math.PI * 2 + t * 0.25
        const amt = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.8 + s * 2.1)) * (0.5 + 0.5 * Math.sin(t * 1.1 + s * 0.7))
        const len = min * 0.075 * (0.4 + 1.5 * amt) * splashAmt
        for (let k = 1; k <= 4; k++) {
          const f = k / 4
          const dist = core * 0.55 + len * f
          pos.set(sp.x + Math.cos(ang) * dist, sp.y + Math.sin(ang) * dist, 0)
          addBall(pos, strengthFor(min * 0.075 * 0.5 * (1 - f * 0.82) * splashAmt), spikeCols[s % spikeCols.length])
        }
      }
    }
    goo.update()
  }

  // ---------- Bucle ----------
  let raf = 0
  let t = 0
  let last = performance.now()
  let lastVeil = -1
  let skip = 0
  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    // Con el velo casi opaco (modo reclutador) basta con ~15 fps.
    if (view === 'reclutador' && veilAmt > 0.75 && ++skip % 4) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (reduce) {
      // Sin movimiento: solo se redibuja cuando cambia algo.
      if (dirty <= 0) return
      dirty--
    } else {
      t += dt
    }

    gather += ((activeKey ? 1 : 0) - gather) * lerpK(0.05)
    pulse = reduce ? 0 : pulse * 0.93
    splashAmt += ((splash.active ? 1 : 0) - splashAmt) * lerpK(0.12)
    const veilTarget = view === 'detalle' ? 0.25 : view === 'reclutador' ? 0.82 : 0
    veilAmt += (veilTarget - veilAmt) * lerpK(0.08)
    if (veil && Math.abs(veilAmt - lastVeil) > 0.001) {
      veil.style.opacity = veilAmt.toFixed(3)
      lastVeil = veilAmt
    }
    pointer.sx += (pointer.nx - pointer.sx) * lerpK(0.06)
    pointer.sy += (pointer.ny - pointer.sy) * lerpK(0.06)
    for (const o of offs) {
      o.vx = (o.vx - o.x * 0.05) * 0.86
      o.vy = (o.vy - o.y * 0.05) * 0.86
      o.x += o.vx
      o.y += o.vy
    }

    updateGoo(t)

    for (const m of allModels) {
      const want = m.target && gather > 0.45 ? 1 : 0
      m.vis += (want - m.vis) * lerpK(want ? 0.07 : 0.16)
      m.holder.visible = m.vis > 0.005
      if (!m.holder.visible) continue
      m.holder.scale.setScalar((layout.size / 2) * Math.max(0.001, easeOutBack(Math.min(1, m.vis))))
      m.holder.position.copy(layout.c)
      m.holder.position.y += Math.sin(t * 0.9) * layout.size * 0.015
      m.holder.rotation.x = m.rot[0] - pointer.sy * 0.25
      m.holder.rotation.y = m.rot[1] + Math.sin(t * 0.45) * 0.22 + pointer.sx * 0.45
      m.update(t)
    }
    renderer.render(scene, camera)
  }

  // ---------- Entrada ----------
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.nx = (e.clientX / vw) * 2 - 1
    pointer.ny = -((e.clientY / vh) * 2 - 1)
    pointer.active = e.pointerType === 'mouse'
  }
  const onLeave = () => {
    pointer.active = false
  }
  // Onda al hacer clic/tap: impulso radial que aparta las figuras con rebote.
  const onDown = (e: PointerEvent) => {
    if (reduce || splash.active || activeKey) return
    const min = Math.min(W, H)
    const p = toWorld(e.clientX, e.clientY, tmpA)
    ANCHORS.forEach((A, i) => {
      toWorld(A.x * vw, A.y * vh, base)
      const dx = base.x - p.x
      const dy = base.y - p.y
      const d = Math.hypot(dx, dy) || 1
      const f = Math.exp(-d / (min * 0.38)) * min * 0.035
      offs[i].vx += (dx / d) * f
      offs[i].vy += (dy / d) * f
    })
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  // Si el navegador pierde el contexto WebGL, se pasa al fondo de respaldo en CSS.
  const onContextLost = (e: Event) => {
    e.preventDefault()
    cancelAnimationFrame(raf)
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)
  raf = requestAnimationFrame(frame)

  // ---------- Instantánea para la tarjeta de "Tu forma" ----------
  let card: { r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; env: THREE.WebGLRenderTarget } | null = null
  let shot = { key: '', url: '' }
  function snapshot() {
    if (!superKey) return null
    if (shot.key === superKey) return shot.url
    try {
      shot = { key: superKey, url: renderSnapshot() }
      return shot.url
    } catch {
      // Sin segundo contexto WebGL: la tarjeta usa su silueta 2D de respaldo.
      return null
    }
  }
  function renderSnapshot() {
    if (!card) {
      const r = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, preserveDrawingBuffer: true })
      r.setPixelRatio(1)
      r.setSize(900, 900, false)
      r.setClearColor(0x000000, 0)
      r.toneMapping = THREE.NeutralToneMapping
      r.toneMappingExposure = 1.05
      let e: THREE.WebGLRenderTarget
      try {
        e = makeEnvironment(r)
      } catch (err) {
        // No dejar contextos huérfanos si la preparación falla.
        r.dispose()
        r.forceContextLoss()
        throw err
      }
      const s = new THREE.Scene()
      s.environment = e.texture
      const l = new THREE.DirectionalLight(0xffffff, 1.3)
      l.position.set(4, 6, 8)
      s.add(l)
      const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
      cam.position.set(0, 0, 6.6)
      card = { r, scene: s, cam, env: e }
    }
    const m = new THREE.Mesh(superMesh.geometry, superMat)
    m.rotation.set(0.45, -0.6, 0)
    card.scene.add(m)
    card.r.render(card.scene, card.cam)
    card.scene.remove(m)
    return card.r.domElement.toDataURL('image/png')
  }

  return {
    setView(v, p) {
      view = v
      project = p
      if (v !== 'inicio') splash.active = false
      refresh()
    },
    setProject(p) {
      project = p
      refresh()
    },
    setCluster(d) {
      splash.active = d.active
      if (d.active) {
        splash.x = d.x ?? vw / 2
        splash.y = d.y ?? vh / 2
      }
      dirty = 3
    },
    setSupershape(P) {
      buildSuper(P)
      refresh()
    },
    snapshot,
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((mt: THREE.Material) => mt.dispose())
        }
      })
      env.dispose()
      renderer.dispose()
      if (card) {
        card.env.dispose()
        card.r.dispose()
        // Contexto propio (canvas fuera del DOM): se libera del todo.
        card.r.forceContextLoss()
      }
    },
  }
}
