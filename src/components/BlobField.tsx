'use client'

import { useEffect, useRef } from 'react'

/**
 * Fondo interactivo: blobs orgánicos ALARGADOS e iridiscentes que flotan en las
 * esquinas y enmarcan el contenido. Cada blob se ondula con suavidad (sin giro
 * errático), tiene relleno en gradiente pastel, un brillo glossy y un resplandor
 * difuso detrás. Reaccionan al cursor con paralaje y se AGRUPAN hacia un punto
 * cuando se dispara el evento `blobcluster` (al pasar el cursor sobre el nombre).
 *
 * Todo vive en un loop de requestAnimationFrame y en refs (cero re-renders de
 * React por frame). Honra prefers-reduced-motion con una composición estática.
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
  { x: 0.13, y: 0.24, r: 0.15, elong: 2.2, depth: 0.05 },
  { x: 0.87, y: 0.2, r: 0.13, elong: 2.0, depth: 0.08 },
  { x: 0.18, y: 0.8, r: 0.16, elong: 2.4, depth: 0.06 },
  { x: 0.84, y: 0.82, r: 0.14, elong: 2.1, depth: 0.09 },
  { x: 0.98, y: 0.5, r: 0.12, elong: 1.8, depth: 0.05 },
]

type Blob = {
  ax: number
  ay: number
  depth: number
  baseR: number
  elong: number
  orient: number
  orientSpeed: number
  phase: number
  speed: number
  amp: number
  colors: Pair
  x: number
  y: number
  ox: number
  oy: number
}

const POINTS = 12

function buildBlobs(w: number, h: number): Blob[] {
  const min = Math.min(w, h)
  return ANCHORS.map((a, i) => ({
    ax: a.x,
    ay: a.y,
    depth: a.depth,
    baseR: min * a.r,
    elong: a.elong,
    orient: Math.random() * Math.PI,
    orientSpeed: (Math.random() - 0.5) * 0.0003,
    phase: Math.random() * Math.PI * 2,
    speed: 0.25 + Math.random() * 0.2,
    amp: 0.1 + Math.random() * 0.05,
    colors: PALETTE[i % PALETTE.length],
    x: a.x * w,
    y: a.y * h,
    ox: 0,
    oy: 0,
  }))
}

export default function BlobField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let blobs: Blob[] = []
    const pointer = { x: 0, y: 0, active: false }
    const cluster = { x: 0, y: 0, active: false }
    let raf = 0
    let t = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const prev = blobs
      blobs = buildBlobs(w, h)
      // conserva posiciones actuales en un resize para evitar saltos
      if (prev.length === blobs.length) blobs.forEach((b, i) => { b.x = prev[i].x; b.y = prev[i].y })
    }

    const drawBlob = (b: Blob) => {
      const cx = b.x
      const cy = b.y
      const rx = b.baseR * b.elong
      const ry = b.baseR
      const cos = Math.cos(b.orient)
      const sin = Math.sin(b.orient)

      // Resplandor difuso detrás.
      const gr = Math.max(rx, ry) * 1.5
      const glow = ctx.createRadialGradient(cx, cy, gr * 0.15, cx, cy, gr)
      glow.addColorStop(0, hexA(b.colors[0], 0.42))
      glow.addColorStop(1, hexA(b.colors[0], 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, gr, 0, Math.PI * 2)
      ctx.fill()

      // Puntos sobre una elipse alargada, con ondulación suave.
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i < POINTS; i++) {
        const ang = (i / POINTS) * Math.PI * 2
        const wob =
          1 +
          b.amp * Math.sin(t * b.speed + b.phase + i * 1.3) +
          b.amp * 0.4 * Math.cos(t * b.speed * 0.7 + i * 2.1)
        const ex = Math.cos(ang) * rx * wob
        const ey = Math.sin(ang) * ry * wob
        pts.push({ x: cx + ex * cos - ey * sin, y: cy + ex * sin + ey * cos })
      }

      ctx.beginPath()
      const start = midpoint(pts[POINTS - 1], pts[0])
      ctx.moveTo(start.x, start.y)
      for (let i = 0; i < POINTS; i++) {
        const curr = pts[i]
        const mid = midpoint(curr, pts[(i + 1) % POINTS])
        ctx.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y)
      }
      ctx.closePath()

      // Relleno iridiscente a lo largo del eje mayor.
      const gx = cos * rx
      const gy = sin * rx
      const grad = ctx.createLinearGradient(cx - gx, cy - gy, cx + gx, cy + gy)
      grad.addColorStop(0, b.colors[0])
      grad.addColorStop(1, b.colors[1])
      ctx.fillStyle = grad
      ctx.fill()

      // Brillo glossy.
      const hx = cx - gx * 0.35 - ry * 0.2 * sin
      const hy = cy - gy * 0.35 + ry * 0.2 * cos
      const hi = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.max(rx, ry) * 0.9)
      hi.addColorStop(0, 'rgba(255,255,255,0.5)')
      hi.addColorStop(0.45, 'rgba(255,255,255,0.06)')
      hi.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hi
      ctx.fill()
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      const n = blobs.length
      blobs.forEach((b, i) => {
        let tx: number
        let ty: number
        if (cluster.active) {
          // Agrupación: se ordenan en una franja compacta alrededor del punto.
          const k = i - (n - 1) / 2
          tx = cluster.x + k * (b.baseR * 0.9)
          ty = cluster.y + Math.sin(i * 1.7) * b.baseR * 0.5
          b.orient += (0 - b.orient) * 0.05
        } else {
          const px = pointer.active ? (pointer.x - w / 2) * b.depth : 0
          const py = pointer.active ? (pointer.y - h / 2) * b.depth : 0
          b.ox += (px - b.ox) * 0.05
          b.oy += (py - b.oy) * 0.05
          tx = b.ax * w + b.ox
          ty = b.ay * h + b.oy
          b.orient += b.orientSpeed
        }
        const ease = cluster.active ? 0.08 : 0.06
        b.x += (tx - b.x) * ease
        b.y += (ty - b.y) * ease
        drawBlob(b)
      })
    }

    if (reduce) {
      resize()
      render()
      return () => {}
    }

    const frame = () => {
      t += 0.016
      render()
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onCluster = (e: Event) => {
      const d = (e as CustomEvent).detail as { active: boolean; x?: number; y?: number }
      cluster.active = d.active
      if (d.active && typeof d.x === 'number' && typeof d.y === 'number') {
        cluster.x = d.x
        cluster.y = d.y
      }
    }

    resize()
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
