'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { projects, imgUrl } from '@/data/portfolio'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Proyectos({ onOpen }: { onOpen: (i: number) => void }) {
  const [active, setActive] = useState(0)
  const p = projects[active]

  return (
    <div className="flex h-full flex-col justify-center overflow-y-auto px-5 pb-10 pt-24 md:px-8">
      <div className="mx-auto w-full max-w-shell">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] uppercase">Proyectos</h2>
          <span className="text-lg text-muted">{projects.length}</span>
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-12">
          {/* Lista */}
          <div className="md:col-span-7">
            <ul>
              {projects.map((proj, i) => (
                <li key={proj.title}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => onOpen(i)}
                    className={`group grid w-full grid-cols-12 items-baseline gap-3 border-t border-line py-5 text-left transition-opacity ${
                      i === active ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="col-span-2 text-sm text-muted">0{i + 1}</span>
                    <span className="col-span-7 display text-xl uppercase md:text-2xl">{proj.title}</span>
                    <span className="col-span-3 hidden text-right text-sm text-muted sm:block">{proj.category}</span>
                  </button>

                  {/* Media en línea (solo móvil) */}
                  <button onClick={() => onOpen(i)} className="block w-full pb-8 text-left md:hidden">
                    <div className="card aspect-[16/10]">
                      <img src={imgUrl(proj.seed, 1000, 625)} alt={`Vista del proyecto ${proj.title}`} loading="lazy" />
                    </div>
                    <p className="mt-3 text-sm text-muted">{proj.category} · {proj.year}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Vista previa (solo escritorio) */}
          <div className="hidden md:col-span-5 md:block">
            <AnimatePresence mode="wait">
              <motion.button
                key={active}
                onClick={() => onOpen(active)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="group block w-full text-left"
              >
                <div className="card aspect-[4/3]">
                  <img src={imgUrl(p.seed, 1100, 825)} alt={`Vista del proyecto ${p.title}`} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted">
                  <span>{p.category}</span>
                  <span>{p.year}</span>
                </div>
                <span className="cta link-underline mt-3 text-sm">
                  <ArrowUpRight size={16} />
                  Ver proyecto
                </span>
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
