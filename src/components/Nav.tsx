'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Moon, Sun, X } from 'lucide-react'
import type { View } from '@/lib/cluster'

const items: { n: string; view: View; label: string }[] = [
  { n: '01', view: 'inicio', label: 'Inicio' },
  { n: '02', view: 'proyectos', label: 'Proyectos' },
  { n: '03', view: 'sobre-mi', label: 'Sobre mí' },
  { n: '04', view: 'contacto', label: 'Contacto' },
]

const social = [
  { label: 'GitHub', href: 'https://github.com/danieln3m0' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/francis-daniel-mamani-silva-562ab6307/' },
]

const EASE = [0.16, 1, 0.3, 1] as const

function DotsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
      {[3, 11, 19].map((y) =>
        [3, 11, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />)
      )}
    </svg>
  )
}

export default function Nav({ current, onNavigate }: { current: View; onNavigate: (v: View) => void }) {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const reduce = useReducedMotion()
  const activeView: View = current === 'detalle' ? 'proyectos' : current

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Sincroniza el estado con la clase que el script anti-parpadeo ya aplicó.
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
    setDark(next)
  }

  const go = (v: View) => {
    setOpen(false)
    onNavigate(v)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-16 max-w-shell items-center justify-between px-5 md:px-8">
          <button onClick={() => go('inicio')} className="text-sm tracking-wide text-ink">
            <span className="font-medium">Francis Daniel</span>
            <span className="text-muted"> / creative coder</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="grid h-10 w-10 place-items-center text-ink transition-opacity hover:opacity-60"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center text-ink transition-opacity hover:opacity-60"
            >
              <DotsIcon />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-paper/85 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="mx-auto flex h-full max-w-shell flex-col px-5 md:px-8">
              <div className="flex h-16 items-center justify-between">
                <span className="text-sm tracking-wide text-muted">Francis Daniel / creative coder</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleTheme}
                    aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
                    className="grid h-10 w-10 place-items-center text-ink transition-opacity hover:opacity-60"
                  >
                    {dark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar menú"
                    className="grid h-10 w-10 place-items-center text-ink transition-opacity hover:opacity-60"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <nav className="flex flex-1 flex-col justify-center">
                <ul>
                  {items.map((it, i) => (
                    <motion.li
                      key={it.view}
                      initial={reduce ? false : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: EASE }}
                    >
                      <button onClick={() => go(it.view)} className="group flex items-baseline gap-5 py-2 text-left">
                        <span className="text-sm text-muted">{it.n}</span>
                        <span
                          className={`display text-[clamp(2.4rem,9vw,5.5rem)] uppercase leading-none transition-transform duration-500 group-hover:translate-x-3 ${
                            activeView === it.view ? 'text-ink' : 'text-ink/35'
                          }`}
                        >
                          {it.label}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-8 pb-10"
              >
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta text-muted hover:text-ink"
                  >
                    <ArrowUpRight size={16} />
                    {s.label}
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
