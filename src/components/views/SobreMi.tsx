'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { stack, cvUrl, imgUrl } from '@/data/portfolio'

const EASE = [0.16, 1, 0.3, 1] as const
const core = stack.flatMap((g) => g.items).filter((i) => i.core).map((i) => i.name)

export default function SobreMi() {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  })

  return (
    <div className="flex h-full flex-col justify-center overflow-y-auto px-5 pb-10 pt-24 md:px-8">
      <div className="mx-auto grid w-full max-w-shell items-center gap-10 md:grid-cols-12">
        {/* Media */}
        <motion.div {...rise(0.05)} className="hidden md:col-span-5 md:block">
          <div className="card aspect-[4/5] max-h-[70vh]">
            <img
              src={imgUrl('francis-creative-coding-studio', 900, 1125)}
              alt="Espacio de trabajo de Francis Daniel"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* Texto */}
        <div className="md:col-span-7">
          <motion.h2 {...rise(0.1)} className="display text-[clamp(2rem,5.5vw,4rem)] uppercase">
            Sobre mí
          </motion.h2>

          <motion.div {...rise(0.2)} className="mt-6 space-y-5 text-base font-light leading-relaxed text-ink/90 md:text-lg">
            <p>
              Soy ingeniero de software full-stack y estudiante en la UPC.
              Construyo plataformas, interfaces y APIs, y me obsesiona que cada
              pieza se sienta rápida, clara y bien resuelta.
            </p>
            <p>
              Fuera del editor, la música pop es mi motor: de lo que escucho
              nacen los universos visuales que luego intento materializar con
              código. Vivo con una curiosidad terca por las tecnologías creativas.
            </p>
          </motion.div>

          <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm transition-colors hover:bg-ink hover:text-paper"
            >
              <FileText size={16} />
              Ver mi CV
            </a>
            <span className="text-sm text-muted">Egreso previsto: Diciembre 2026 · UPC</span>
          </motion.div>

          <motion.div {...rise(0.4)} className="mt-10 border-t border-line pt-5">
            <p className="mb-3 text-sm text-muted">Stack principal</p>
            <ul className="flex flex-wrap gap-2">
              {core.map((name) => (
                <li key={name} className="rounded-full bg-ink px-3 py-1 text-xs text-paper">{name}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
