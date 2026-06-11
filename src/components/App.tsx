'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import BlobField from './BlobField'
import Nav from './Nav'
import Inicio from './views/Inicio'
import Proyectos from './views/Proyectos'
import ProyectoDetalle from './views/ProyectoDetalle'
import SobreMi from './views/SobreMi'
import Contacto from './views/Contacto'
import { blobView, clusterOff, type View } from '@/lib/cluster'

const EASE = [0.16, 1, 0.3, 1] as const

export default function App() {
  const [view, setView] = useState<View>('inicio')
  const [project, setProject] = useState(0)
  const reduce = useReducedMotion()

  // Avisa al fondo del cambio de vista/proyecto (agrupar, opacar, recolorear).
  useEffect(() => {
    blobView(view, project)
  }, [view, project])

  const navigate = useCallback((v: View) => {
    clusterOff()
    setView(v)
  }, [])

  // Escape vuelve del detalle a la lista (si el menú no está abierto: Nav lo
  // marca con data-menu-overlay y consume la tecla para cerrarse).
  useEffect(() => {
    if (view !== 'detalle') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[data-menu-overlay]')) {
        navigate('proyectos')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, navigate])

  const openProject = useCallback((i: number) => {
    clusterOff()
    setProject(i)
    setView('detalle')
  }, [])

  // Entrada lenta y desenfocada que asienta; salida corta para no hacer esperar.
  const variants = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 22, scale: 0.992, filter: 'blur(10px)' },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: { duration: 0.55, ease: EASE },
        },
        exit: {
          opacity: 0,
          y: -14,
          scale: 0.997,
          filter: 'blur(6px)',
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
        },
      }

  const render = () => {
    switch (view) {
      case 'inicio':
        return <Inicio onNavigate={navigate} />
      case 'proyectos':
        return <Proyectos onOpen={openProject} />
      case 'detalle':
        return <ProyectoDetalle index={project} onBack={() => navigate('proyectos')} onOpen={openProject} />
      case 'sobre-mi':
        return <SobreMi />
      case 'contacto':
        return <Contacto />
    }
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      {/* Resplandor menta + blobs iridiscentes (pieza central) */}
      <div className="glow-mint" aria-hidden="true" />
      <BlobField />

      <Nav current={view} onNavigate={navigate} />

      <AnimatePresence mode="wait">
        <motion.main
          key={view === 'detalle' ? `detalle-${project}` : view}
          variants={variants}
          initial={variants ? 'initial' : false}
          animate={variants ? 'animate' : undefined}
          exit={variants ? 'exit' : undefined}
          className="absolute inset-0"
        >
          {render()}
        </motion.main>
      </AnimatePresence>

      {/* Grano fijo sobre toda la página */}
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
