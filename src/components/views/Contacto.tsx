'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { channels } from '@/data/portfolio'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Contacto() {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  })

  return (
    <div className="flex h-full flex-col justify-center overflow-y-auto px-5 pb-10 pt-24 text-center md:px-8">
      <div className="mx-auto w-full max-w-shell">
        <motion.p {...rise(0.05)} className="eyebrow">Contacto</motion.p>
        <motion.h2 {...rise(0.12)} className="display mx-auto mt-6 max-w-[15ch] text-[clamp(2.2rem,6.5vw,5rem)] uppercase">
          Construimos algo juntos
        </motion.h2>
        <motion.p {...rise(0.2)} className="mx-auto mt-6 max-w-md text-base font-light leading-relaxed text-ink/90">
          Disponible para encargos, prácticas o una buena conversación sobre
          producto, código y formas que cobran vida.
        </motion.p>
        <motion.div {...rise(0.28)} className="mt-8 flex justify-center">
          <a href="mailto:francisdani143@gmail.com" className="cta link-underline">
            <ArrowRight size={17} />
            Escríbeme
          </a>
        </motion.div>

        <motion.div {...rise(0.38)} className="mx-auto mt-14 grid max-w-3xl gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block border-t border-line pt-4 text-left"
            >
              <p className="text-sm text-muted">{c.label}</p>
              <span className="link-underline mt-1 inline-block text-sm">{c.value}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
