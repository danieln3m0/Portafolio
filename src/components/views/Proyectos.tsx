'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Trophy } from 'lucide-react'
import { projects } from '@/data/portfolio'
import { blobProject } from '@/lib/cluster'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Proyectos({ initial = 0, onOpen }: { initial?: number; onOpen: (i: number) => void }) {
  const [active, setActive] = useState(initial)
  const reduce = useReducedMotion()
  const p = projects[active]
  // En pantallas táctiles el primer toque materializa el modelo y el segundo abre el proyecto.
  const touchPreview = useRef(false)

  // Resalta un proyecto: el líquido del fondo se materializa en su modelo 3D.
  const highlight = (i: number) => {
    if (i === active) return
    setActive(i)
    blobProject(i)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-10 pt-24 md:px-8">
      {/* my-auto centra sin recortar el contenido cuando no cabe (justify-center lo cortaría). */}
      <div className="mx-auto my-auto w-full max-w-shell">
        {/* En móvil el modelo 3D se materializa arriba: se le deja sitio. */}
        <div className="h-[30vh] md:hidden" aria-hidden="true" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex flex-col md:col-span-6">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
              <h2 className="display text-[clamp(2rem,5.5vw,4rem)] uppercase">Proyectos</h2>
              <span className="text-lg text-muted">{projects.length}</span>
            </div>

            <ul className="order-2 md:order-none">
              {projects.map((proj, i) => (
                <li key={proj.title}>
                  <button
                    onMouseEnter={() => highlight(i)}
                    onFocus={() => highlight(i)}
                    onPointerDown={(e) => {
                      touchPreview.current = e.pointerType === 'touch' && i !== active
                    }}
                    onPointerCancel={() => (touchPreview.current = false)}
                    onKeyDown={() => (touchPreview.current = false)}
                    onClick={() => {
                      if (touchPreview.current) {
                        touchPreview.current = false
                        highlight(i)
                        return
                      }
                      onOpen(i)
                    }}
                    aria-current={i === active ? 'true' : undefined}
                    className={`group grid w-full grid-cols-12 items-baseline gap-3 border-b border-line py-5 text-left transition-opacity duration-300 ${
                      i === active ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="col-span-2 text-sm text-muted">0{i + 1}</span>
                    <span className="col-span-7 flex items-center gap-3">
                      <span
                        className={`display text-xl uppercase md:text-2xl transition-transform duration-500 ease-out ${
                          i === active ? 'md:translate-x-2' : ''
                        }`}
                      >
                        {proj.title}
                      </span>
                      <ArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className={`hidden shrink-0 transition-[opacity,transform] duration-300 md:block ${
                          i === active ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                        }`}
                      />
                    </span>
                    <span className="col-span-3 hidden text-right text-sm text-muted sm:block">{proj.category}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Qué forma toma el fondo y de qué va el proyecto activo (en móvil, antes de la lista: junto al modelo). */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, ease: EASE }}
                className="order-1 mb-2 mt-6 grid gap-3 md:order-none md:mb-0"
              >
                <span className="justify-self-start rounded-full border border-line bg-paper/70 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">
                  Forma · {p.shape}
                </span>
                {p.award && (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Trophy size={14} aria-hidden="true" />
                    {p.award}
                  </span>
                )}
                <p className="max-w-xl font-light leading-relaxed text-ink/90">{p.challenge}</p>
                <button onClick={() => onOpen(active)} className="cta link-underline justify-self-start text-sm">
                  <ArrowUpRight size={16} />
                  Ver proyecto
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Columna derecha vacía: ahí se materializa el modelo 3D del fondo. */}
          <div className="hidden md:col-span-6 md:block" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
