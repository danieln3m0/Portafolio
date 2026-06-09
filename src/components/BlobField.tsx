'use client'

import { useEffect, useRef } from 'react'

/**
 * Fondo interactivo de METABALLS. Cada cuerpo es un campo suave y, mediante un
 * filtro "goo" de SVG (blur + umbral de alfa), los cuerpos cercanos se fusionan
 * con tensión superficial orgánica.
 *
 * En reposo (lámpara de lava): las figuras de las esquinas se ondulan y, cada
 * cierto tiempo, una "pare" una gota. La gota NACE EN EL BORDE de la figura, en
 * la dirección de una figura vecina; se hincha formando un cuello, se pinza al
 * alejarse (el goo dibuja el estiramiento) y al llegar a la vecina se fusiona:
 * comparten masa (la emisora adelgaza, la receptora se hincha y ambas relajan).
 *
 * Al pasar el cursor sobre un nombre (evento `blobcluster`): toda la masa se
 * reúne sobre el nombre y se eriza en PÚAS tipo FERROFLUIDO que palpitan, como
 * imán bajo el líquido. Al salir, fluye de vuelta a las esquinas.
 *
 * Dos lienzos: resplandor difuso (sin filtro) + cuerpos sólidos (bajo el goo).
 * Loop de rAF con refs (cero re-renders). Honra prefers-reduced-motion.
 */

type Pair = [string, string]

const PALETTE: Pair[] = [
  ['#a8ecc9', '#bfe6f2'],
  ['#f7c0c4', '#ffd9ac'],
  ['#cabdf2', '#bcd0f6'],
  ['#bfeede', '#a9d8f5'],
  ['#f3eca6', '#f6c5c9'],
]

// Anclas relativas (fracción de viewport) para enmarcar el centro sin taparlo.
const ANCHORS = [
  { x: 0.13, y: 0.24, r: 0.15, elong: 1.25, depth: 0.05 },
  { x: 0.87, y: 0.2, r: 0.13, elong: 1.2, depth: 0.08 },
  { x: 0.18, y: 0.8, r: 0.16, elong: 1.3, depth: 0.06 },
  { x: 0.84, y: 0.82, r: 0.14, elong: 1.2, depth: 0.09 },
  { x: 0.98, y: 0.5, r: 0.12, elong: 1.15, depth: 0.05 },
]

type Anchor = {
  i: number
  fx: number
  fy: number
  depth: number
  baseR: number
  targetR: number
  r: number
  elong: number
  orient: number
  orientSpeed: number
  phase: number
  speed: number
  amp: number
  colors: Pair
  x: number
  y: number
  vx: number
  vy: number
  ox: number
  oy: number
}

type Drop = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  r: number
  targetR: number
  from: number
  to: number
  birth: number
  orient: number
  sx: number
  sy: number
  prog: number
  travelDur: number
  bend: number
  colors: Pair
  phase: number
}

const POINTS = 12
const DROP_POOL = 6
const SPIKES = 12

function buildAnchors(w: number, h: number): Anchor[] {
  const min = Math.min(w, h)
  return ANCHORS.map((a, i) => {
    const baseR = min * a.r
    return {
      i,
      fx: a.x,
      fy: a.y,
      depth: a.depth,
      baseR,
      targetR: baseR,
      r: baseR,
      elong: a.elong,
      orient: Math.random() * Math.PI,
      orientSpeed: (Math.random() - 0.5) * 0.0004,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.2,
      amp: 0.12 + Math.random() * 0.07,
      colors: PALETTE[i % PALETTE.length],
      x: a.x * w,
      y: a.y * h,
      vx: 0,
      vy: 0,
      ox: 0,
      oy: 0,
    }
  })
}

// Para cada ancla, las otras anclas ordenadas por cercanía: define hacia dónde
// se desprenden las gotas (siempre hacia una figura vecina).
function buildNeighbors(): number[][] {
  return ANCHORS.map((a, i) =>
    ANCHORS.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .map((o) => o.j),
  )
}

export default function BlobField() {
  const glowRef = useRef<HTMLCanvasElement>(null)
  const gooRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const glowCanvas = glowRef.current
    const gooCanvas = gooRef.current
    if (!glowCanvas || !gooCanvas) return
    const gctx = glowCanvas.getContext('2d')
    const ctx = gooCanvas.getContext('2d')
    if (!gctx || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let anchors: Anchor[] = []
    const neighbors = buildNeighbors()
    const drops: Drop[] = Array.from({ length: DROP_POOL }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 0,
      targetR: 0,
      from: 0,
      to: 0,
      birth: 0,
      orient: 0,
      sx: 0,
      sy: 0,
      prog: 0,
      travelDur: 3,
      bend: 0,
      colors: PALETTE[0],
      phase: 0,
    }))

    const pointer = { x: 0, y: 0, active: false }
    const splash = { active: false, x: 0, y: 0, w: 0, h: 0 }
    let splashAmt = 0
    let wasSplash = false
    let emitTimer = 1.2
    let raf = 0
    let t = 0
    let last = performance.now()

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const c of [glowCanvas, gooCanvas]) {
        c.width = Math.floor(w * dpr)
        c.height = Math.floor(h * dpr)
        c.style.width = `${w}px`
        c.style.height = `${h}px`
      }
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const prev = anchors
      anchors = buildAnchors(w, h)
      if (prev.length === anchors.length) {
        anchors.forEach((a, i) => {
          a.x = prev[i].x
          a.y = prev[i].y
        })
      }
    }

    // Desprende una gota desde el BORDE de un ancla hacia una vecina: la emisora
    // pierde masa. La gota nace pegada al borde (birth>0) formando un cuello.
    const emit = () => {
      const drop = drops.find((d) => !d.active)
      if (!drop) return
      const from = (Math.random() * anchors.length) | 0
      const nbrs = neighbors[from]
      const to = nbrs[(Math.random() * Math.min(2, nbrs.length)) | 0]
      const a = anchors[from]
      const b = anchors[to]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const L = Math.hypot(dx, dy) || 1
      drop.active = true
      drop.from = from
      drop.to = to
      drop.x = a.x + (dx / L) * a.r * a.elong * 0.85
      drop.y = a.y + (dy / L) * a.r * a.elong * 0.85
      drop.vx = 0
      drop.vy = 0
      drop.r = a.baseR * 0.18
      drop.targetR = a.baseR * (0.34 + Math.random() * 0.13)
      drop.birth = 0.8 + Math.random() * 0.4
      drop.orient = Math.atan2(dy, dx)
      drop.prog = 0
      drop.travelDur = 2.6 + Math.random() * 0.9
      drop.bend = (Math.random() * 2 - 1) * 0.15
      drop.colors = a.colors
      drop.phase = Math.random() * Math.PI * 2
      a.targetR = a.baseR * 0.82
    }

    const pathBlob = (
      x: number,
      y: number,
      r: number,
      elong: number,
      orient: number,
      amp: number,
      phase: number,
      n: number,
    ) => {
      const rx = r * elong
      const ry = r
      const cos = Math.cos(orient)
      const sin = Math.sin(orient)
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2
        const wob =
          1 + amp * Math.sin(t * 0.6 + phase + i * 1.3) + amp * 0.4 * Math.cos(t * 0.5 + i * 2.1)
        const ex = Math.cos(ang) * rx * wob
        const ey = Math.sin(ang) * ry * wob
        pts.push({ x: x + ex * cos - ey * sin, y: y + ex * sin + ey * cos })
      }
      ctx.beginPath()
      const start = midpoint(pts[n - 1], pts[0])
      ctx.moveTo(start.x, start.y)
      for (let i = 0; i < n; i++) {
        const curr = pts[i]
        const mid = midpoint(curr, pts[(i + 1) % n])
        ctx.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y)
      }
      ctx.closePath()
    }

    const fillBody = (x: number, y: number, r: number, elong: number, colors: Pair) => {
      const rmax = r * elong
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, rmax)
      grad.addColorStop(0, lighten(colors[0], 0.28))
      grad.addColorStop(1, colors[1])
      ctx.fillStyle = grad
      ctx.fill()
    }

    const blob = (
      x: number,
      y: number,
      r: number,
      colors: Pair,
      elong = 1,
      orient = 0,
      amp = 0.12,
      phase = 0,
      n = 8,
    ) => {
      pathBlob(x, y, r, elong, orient, amp, phase, n)
      fillBody(x, y, r, elong, colors)
    }

    // Corona de ferrofluido: núcleo + púas radiales que palpitan y se afilan.
    const drawFerro = () => {
      const cx = splash.x
      const cy = splash.y
      const min = Math.min(w, h)
      const baseCore = min * 0.075
      const coreR = baseCore * splashAmt
      blob(cx, cy, coreR, PALETTE[2], 1, 0, 0.1, 0, 12)
      for (let s = 0; s < SPIKES; s++) {
        const ang = (s / SPIKES) * Math.PI * 2 + t * 0.25
        const p1 = 0.5 + 0.5 * Math.sin(t * 1.8 + s * 2.1)
        const p2 = 0.5 + 0.5 * Math.sin(t * 1.1 + s * 0.7)
        const amt = 0.35 + 0.65 * p1 * p2
        const len = baseCore * (0.4 + 1.5 * amt) * splashAmt
        const colors = PALETTE[s % PALETTE.length]
        const steps = 4
        for (let k = 1; k <= steps; k++) {
          const f = k / steps
          const dist = coreR * 0.55 + len * f
          const px = cx + Math.cos(ang) * dist
          const py = cy + Math.sin(ang) * dist
          const rr = baseCore * 0.5 * (1 - f * 0.82) * splashAmt
          if (rr > 1.5) blob(px, py, rr, colors, 1, 0, 0.18, s + k, 7)
        }
      }
    }

    const render = () => {
      gctx.clearRect(0, 0, w, h)
      ctx.clearRect(0, 0, w, h)

      // Resplandor difuso de fondo (sin filtro goo).
      for (const a of anchors) {
        const gr = a.r * a.elong * 2.2
        const glow = gctx.createRadialGradient(a.x, a.y, gr * 0.12, a.x, a.y, gr)
        glow.addColorStop(0, hexA(a.colors[0], 0.28))
        glow.addColorStop(1, hexA(a.colors[0], 0))
        gctx.fillStyle = glow
        gctx.beginPath()
        gctx.arc(a.x, a.y, gr, 0, Math.PI * 2)
        gctx.fill()
      }

      // Cuerpos sólidos (bajo el filtro goo): anclas, gotas y, si toca, ferro.
      for (const a of anchors) blob(a.x, a.y, a.r, a.colors, a.elong, a.orient, a.amp, a.phase, POINTS)
      for (const d of drops) {
        if (d.active) blob(d.x, d.y, d.r, d.colors, 1.6, d.orient, 0.16, d.phase, 8)
      }
      if (splashAmt > 0.02) drawFerro()
    }

    const step = (dt: number) => {
      // Al entrar al splash, recoge las gotas en vuelo (toda la masa se reúne).
      if (splash.active && !wasSplash) {
        for (const d of drops) d.active = false
      }
      wasSplash = splash.active
      splashAmt += ((splash.active ? 1 : 0) - splashAmt) * 0.12

      // Emisión de gotas solo en reposo.
      if (!splash.active) {
        emitTimer -= dt
        if (emitTimer <= 0) {
          emit()
          emitTimer = 1.8 + Math.random() * 2.4
        }
      }

      const n = anchors.length
      const min = Math.min(w, h)
      for (const a of anchors) {
        // Relajación de masa hacia su reposo (compartir/recuperar masa).
        a.targetR += (a.baseR - a.targetR) * 0.03
        a.r += (a.targetR - a.r) * 0.12
        a.orient += a.orientSpeed

        if (splash.active) {
          // Se reúnen y orbitan en un núcleo apretado sobre el nombre.
          const ang0 = (a.i / n) * Math.PI * 2 + t * 0.3
          const ring = min * 0.05
          const tx = splash.x + Math.cos(ang0) * ring
          const ty = splash.y + Math.sin(ang0) * ring
          const k = 0.09
          a.vx = (a.vx + (tx - a.x) * k) * 0.82
          a.vy = (a.vy + (ty - a.y) * k) * 0.82
        } else {
          const px = pointer.active ? (pointer.x - w / 2) * a.depth : 0
          const py = pointer.active ? (pointer.y - h / 2) * a.depth : 0
          a.ox += (px - a.ox) * 0.05
          a.oy += (py - a.oy) * 0.05
          const bobx = Math.sin(t * a.speed + a.phase) * a.baseR * 0.1
          const boby = Math.cos(t * a.speed * 0.8 + a.phase * 1.3) * a.baseR * 0.1
          const tx = a.fx * w + a.ox + bobx
          const ty = a.fy * h + a.oy + boby
          const k = 0.025
          a.vx = (a.vx + (tx - a.x) * k) * 0.9
          a.vy = (a.vy + (ty - a.y) * k) * 0.9
        }
        a.x += a.vx
        a.y += a.vy
      }

      for (const d of drops) {
        if (!d.active) continue

        if (d.birth > 0) {
          // Fase de cuello: nace pegada al borde de la emisora y se hincha.
          const prevBirth = d.birth
          d.birth -= dt
          const a = anchors[d.from]
          const b = anchors[d.to]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const L = Math.hypot(dx, dy) || 1
          const tx = a.x + (dx / L) * a.r * a.elong * 0.95
          const ty = a.y + (dy / L) * a.r * a.elong * 0.95
          const k = 0.1
          d.vx = (d.vx + (tx - d.x) * k) * 0.9
          d.vy = (d.vy + (ty - d.y) * k) * 0.9
          d.x += d.vx
          d.y += d.vy
          d.r += (d.targetR - d.r) * 0.08
          d.orient = Math.atan2(ty - d.y, tx - d.x)
          if (prevBirth > 0 && d.birth <= 0) {
            // Se desprende: fija el punto de partida del viaje.
            d.sx = d.x
            d.sy = d.y
            d.prog = 0
          }
          continue
        }

        // Fase de viaje (~3 s): trayectoria curva con arranque y llegada suaves.
        d.prog += dt / d.travelDur
        const b = anchors[d.to]
        if (d.prog >= 1) {
          // Fusión: la receptora se hincha y luego relaja (recibe la masa).
          b.targetR = b.baseR * 1.18
          d.active = false
          continue
        }
        const e = d.prog * d.prog * (3 - 2 * d.prog) // smoothstep
        const dirx = b.x - d.sx
        const diry = b.y - d.sy
        const L = Math.hypot(dirx, diry) || 1
        const arc = Math.sin(d.prog * Math.PI) // 0 en extremos, 1 en el medio
        const fx = d.sx + dirx * e + (-diry / L) * arc * d.bend * L
        const fy = d.sy + diry * e + (dirx / L) * arc * d.bend * L + arc * L * 0.07
        const ang = Math.atan2(fy - d.y, fx - d.x)
        let da = ang - d.orient
        da = Math.atan2(Math.sin(da), Math.cos(da))
        d.orient += da * 0.2
        d.x = fx
        d.y = fy
        d.r += (d.targetR - d.r) * 0.05
      }
    }

    if (reduce) {
      resize()
      render()
      window.addEventListener('resize', () => {
        resize()
        render()
      })
      return () => {}
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt
      step(dt)
      render()
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onCluster = (e: Event) => {
      const d = (e as CustomEvent).detail as {
        active: boolean
        x?: number
        y?: number
        w?: number
        h?: number
      }
      splash.active = d.active
      if (d.active) {
        splash.x = d.x ?? w / 2
        splash.y = d.y ?? h / 2
        splash.w = d.w ?? 0
        splash.h = d.h ?? 0
      }
    }

    resize()
    last = performance.now()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blobcluster', onCluster as EventListener)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blobcluster', onCluster as EventListener)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={glowRef} className="absolute inset-0" />
      <canvas ref={gooRef} className="absolute inset-0" style={{ filter: 'url(#blob-goo)' }} />
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter
            id="blob-goo"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(c + (255 - c) * amt)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}
