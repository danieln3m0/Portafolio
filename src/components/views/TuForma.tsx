'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import { blobSupershape } from '@/lib/cluster'
import { takeSnapshot } from '@/lib/sceneBridge'
import {
  cleanName,
  DEFAULT_NAME,
  describeParams,
  MAX_NAME,
  paramsFor,
  superformula,
  type SupershapeParams,
} from '@/lib/supershape'

const EASE = [0.16, 1, 0.3, 1] as const
const CARD_W = 1080
const CARD_H = 1350

// Silueta 2D de respaldo para la tarjeta si la escena 3D no está disponible.
function fallbackShape(g: CanvasRenderingContext2D, P: SupershapeParams, cx: number, cy: number, R: number) {
  const pts: [number, number][] = []
  let max = 0
  for (let i = 0; i < 720; i++) {
    const phi = (i / 720) * Math.PI * 2
    const r = superformula(P.a, phi)
    pts.push([phi, r])
    if (r > max) max = r
  }
  g.beginPath()
  pts.forEach(([phi, r], i) => {
    const x = cx + Math.cos(phi) * (r / max) * R
    const y = cy + Math.sin(phi) * (r / max) * R
    if (i) g.lineTo(x, y)
    else g.moveTo(x, y)
  })
  g.closePath()
  const fill = g.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 20, cx, cy, R * 1.1)
  fill.addColorStop(0, '#ffffff')
  fill.addColorStop(0.4, '#cabdf2')
  fill.addColorStop(1, '#9fb6f6')
  g.fillStyle = fill
  g.fill()
}

// La tarjeta es una imagen para exportar: usa la paleta clara fija del portafolio.
function paintCard(canvas: HTMLCanvasElement, name: string, P: SupershapeParams, shot: HTMLImageElement | null) {
  const g = canvas.getContext('2d')
  if (!g) return
  // La fuente de next/font tiene un nombre generado: se toma la del body.
  const family = getComputedStyle(document.body).fontFamily
  g.fillStyle = '#eae9e5'
  g.fillRect(0, 0, CARD_W, CARD_H)
  const glow = g.createRadialGradient(CARD_W * 0.86, CARD_H * 0.08, 10, CARD_W * 0.86, CARD_H * 0.08, 620)
  glow.addColorStop(0, 'rgba(159,232,203,0.55)')
  glow.addColorStop(1, 'rgba(159,232,203,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, CARD_W, CARD_H)
  if (shot) g.drawImage(shot, (CARD_W - 860) / 2, 170, 860, 860)
  else fallbackShape(g, P, CARD_W / 2, 600, 330)

  g.fillStyle = '#5f6186'
  g.font = `500 28px ${family}`
  g.fillText('PORTAFOLIO · FRANCIS DANIEL', 80, 110)
  g.fillStyle = '#3a3c58'
  g.font = `800 64px ${family}`
  g.fillText('LA FORMA DE', 80, 1110)
  const label = name.toUpperCase()
  let size = 116
  g.font = `800 ${size}px ${family}`
  while (g.measureText(label).width > CARD_W - 160 && size > 50) {
    size -= 6
    g.font = `800 ${size}px ${family}`
  }
  g.lineWidth = 3
  g.strokeStyle = '#3a3c58'
  g.strokeText(label, 80, 1110 + size + 6)
  g.fillStyle = '#5f6186'
  g.font = `300 28px ${family}`
  g.fillText(describeParams(P), 80, 1300)
}

const fileName = (name: string) =>
  `forma-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'visitante'}.png`

export default function TuForma() {
  const reduce = useReducedMotion()
  const [input, setInput] = useState(DEFAULT_NAME)
  const [name, setName] = useState(DEFAULT_NAME)
  const [status, setStatus] = useState('')
  const [canShare, setCanShare] = useState(false)
  const params = useMemo(() => paramsFor(name), [name])
  const cardRef = useRef<HTMLCanvasElement>(null)
  const blobRef = useRef<Blob | null>(null)

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  })

  // Materializa la forma en el fondo y redibuja la tarjeta con su instantánea 3D.
  useEffect(() => {
    blobSupershape(params)
    // El PNG anterior ya no corresponde a este nombre.
    blobRef.current = null
    let alive = true
    const draw = () => {
      const canvas = cardRef.current
      if (!canvas || !alive) return
      // Tras pintar deja listo el PNG: compartir no puede esperar a generarlo (Safari).
      const paint = (img: HTMLImageElement | null) => {
        paintCard(canvas, name, params, img)
        canvas.toBlob((b) => {
          if (alive) blobRef.current = b
        }, 'image/png')
      }
      const shot = takeSnapshot()
      if (!shot) return paint(null)
      const img = new Image()
      img.onload = () => alive && paint(img)
      img.src = shot
    }
    draw()
    document.fonts?.ready.then(draw).catch(() => {})
    window.addEventListener('scene-ready', draw)
    return () => {
      alive = false
      window.removeEventListener('scene-ready', draw)
    }
  }, [name, params])

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.canShare === 'function')
  }, [])

  const toBlob = () =>
    new Promise<Blob | null>((res) => (cardRef.current ? cardRef.current.toBlob(res, 'image/png') : res(null)))

  const download = async () => {
    const blob = await toBlob()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName(name)
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Tarjeta descargada.')
  }

  const share = async () => {
    const blob = blobRef.current
    if (!blob) {
      setStatus('La tarjeta aún se está generando; inténtalo en un momento.')
      return
    }
    const file = new File([blob], fileName(name), { type: 'image/png' })
    if (!navigator.canShare?.({ files: [file] })) {
      setStatus('Tu navegador no permite compartir imágenes; usa Descargar.')
      return
    }
    try {
      await navigator.share({ files: [file], title: `La forma de ${name}` })
    } catch {
      // El visitante cerró el diálogo de compartir.
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-10 pt-24 md:px-8">
      {/* my-auto centra sin recortar el contenido cuando no cabe. */}
      <div className="mx-auto my-auto grid w-full max-w-shell gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="h-[30vh] md:hidden" aria-hidden="true" />
          <motion.p {...rise(0.05)} className="eyebrow">Recuerdo de tu visita</motion.p>
          <motion.h2 {...rise(0.1)} className="display mt-4 text-[clamp(2rem,5.5vw,4rem)] uppercase">
            Tu forma
          </motion.h2>
          <motion.p {...rise(0.18)} className="mt-5 max-w-md text-base font-light leading-relaxed text-ink/90">
            Tu nombre siembra dos superfórmulas de Gielis que se combinan en una figura 3D. El mismo nombre
            siempre da la misma forma.
          </motion.p>

          <motion.form
            {...rise(0.26)}
            className="mt-7 flex flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setName(cleanName(input))
              setStatus('')
            }}
          >
            <label htmlFor="visitor-name" className="w-full text-sm text-muted">
              Tu nombre
            </label>
            <input
              id="visitor-name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_NAME}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-line bg-paper/70 px-4 py-2.5 text-ink backdrop-blur"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-[opacity,transform] duration-300 hover:opacity-85 active:scale-[0.97]"
            >
              Materializar
            </button>
          </motion.form>

          <motion.p {...rise(0.32)} className="mt-4 text-sm tabular-nums text-muted">
            Superfórmula 3D · {describeParams(params)}
          </motion.p>

          <motion.div {...rise(0.38)} className="mt-6 flex flex-wrap items-end gap-5">
            <canvas
              ref={cardRef}
              width={CARD_W}
              height={CARD_H}
              role="img"
              aria-label={`Tarjeta con la forma de ${name}`}
              className="aspect-[4/5] w-[200px] max-w-full rounded-2xl shadow-[0_24px_50px_-26px_rgb(var(--ink)/0.45)]"
            />
            <div className="grid gap-3">
              <button
                onClick={download}
                className="inline-flex items-center gap-2 justify-self-start rounded-full border border-ink px-5 py-2.5 text-sm transition-[background-color,color,transform] duration-300 hover:bg-ink hover:text-paper active:scale-[0.97]"
              >
                <Download size={16} />
                Descargar tarjeta
              </button>
              {canShare && (
                <button onClick={share} className="cta link-underline justify-self-start text-sm">
                  <Share2 size={16} />
                  Compartir
                </button>
              )}
              <p className="min-h-[1.25rem] text-sm text-muted" aria-live="polite">
                {status}
              </p>
            </div>
          </motion.div>
        </div>
        {/* Columna derecha vacía: ahí se materializa la supershape del fondo. */}
        <div className="hidden md:col-span-6 md:block" aria-hidden="true" />
      </div>
    </div>
  )
}
