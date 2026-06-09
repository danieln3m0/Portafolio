'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { clusterOff, clusterOn, type View } from '@/lib/cluster'

const EASE = [0.16, 1, 0.3, 1] as const

/** Nombre con contorno que agrupa los blobs del fondo al pasar el cursor. */
function Name({ children }: { children: React.ReactNode }) {
  const enter = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    clusterOn(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height)
  }
  return (
    <span
      onPointerEnter={enter}
      onPointerLeave={clusterOff}
      className="text-outline cursor-default transition-opacity hover:opacity-80"
    >
      {children}
    </span>
  )
}

export default function Inicio({ onNavigate }: { onNavigate: (v: View) => void }) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  })

  return (
    <div className="flex h-full items-center justify-center px-5 pt-16 text-center md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <motion.p {...rise(0.05)} className="eyebrow">
          Portafolio · 2026
        </motion.p>

        <motion.h1 {...rise(0.15)} className="display mt-6 text-[clamp(2.1rem,6vw,5rem)] uppercase">
          <span className="block">
            Hola, soy <Name>Francis Daniel</Name>.
          </span>
          <span className="block">
            Pero puedes llamarme <Name>François</Name>.
          </span>
        </motion.h1>

        <motion.p {...rise(0.35)} className="mx-auto mt-7 max-w-md text-base font-light leading-relaxed text-ink/90">
          Desarrollador full-stack, front-end y creative coder.
          Materializo formas con código.
        </motion.p>

        <motion.div {...rise(0.5)} className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <button onClick={() => onNavigate('proyectos')} className="cta link-underline">
            <ArrowRight size={17} />
            Ver proyectos
          </button>
          <button onClick={() => onNavigate('sobre-mi')} className="cta link-underline text-muted hover:text-ink">
            <ArrowRight size={17} />
            Saber más
          </button>
        </motion.div>
      </div>
    </div>
  )
}
