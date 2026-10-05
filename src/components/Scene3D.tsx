'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/portfolio'
import { registerSnapshot } from '@/lib/sceneBridge'
import type { View } from '@/lib/cluster'
import type { SupershapeParams } from '@/lib/supershape'
import type { ClusterDetail, SceneController } from '@/lib/three/scene'

/**
 * Fondo 3D: metaballs líquidos que se materializan en el modelo de cada
 * proyecto (ver src/lib/three/scene.ts). Three.js se carga en diferido para no
 * pesar en la primera carga; si WebGL no está disponible quedan blobs en CSS.
 * Escucha las mismas señales de ventana que el fondo anterior (src/lib/cluster.ts).
 */
export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const failedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctrl: SceneController | null = null
    let cancelled = false
    // Últimas señales recibidas antes de que la escena termine de cargar.
    let lastView: { view: View; project: number } | null = null
    let lastProject: number | null = null
    let lastShape: SupershapeParams | null = null
    // Sin escena 3D, el velo se pone directamente según la vista.
    const applyVeil = (view: View) => {
      if (veilRef.current) {
        veilRef.current.style.opacity = view === 'reclutador' ? '0.82' : view === 'detalle' ? '0.25' : '0'
      }
    }
    const fail = () => {
      failedRef.current = true
      setFailed(true)
      if (lastView) applyVeil(lastView.view)
    }

    const onView = (e: Event) => {
      const d = (e as CustomEvent<{ view: View; project: number }>).detail
      lastView = d
      lastProject = null
      if (failedRef.current) applyVeil(d.view)
      ctrl?.setView(d.view, d.project)
    }
    const onProject = (e: Event) => {
      lastProject = (e as CustomEvent<{ project: number }>).detail.project
      ctrl?.setProject(lastProject)
    }
    const onCluster = (e: Event) => ctrl?.setCluster((e as CustomEvent<ClusterDetail>).detail)
    const onShape = (e: Event) => {
      const p = (e as CustomEvent<{ params: SupershapeParams }>).detail.params
      lastShape = p
      ctrl?.setSupershape(p)
    }
    window.addEventListener('blobview', onView)
    window.addEventListener('blobproject', onProject)
    window.addEventListener('blobcluster', onCluster)
    window.addEventListener('blobshape', onShape)

    import('@/lib/three/scene')
      .then(({ createScene }) => {
        if (cancelled) return
        ctrl = createScene(
          canvas,
          veilRef.current,
          projects.map((p) => p.model),
          () => {
            registerSnapshot(null)
            fail()
          },
        )
        if (lastShape) ctrl.setSupershape(lastShape)
        if (lastView) ctrl.setView(lastView.view, lastView.project)
        if (lastProject !== null) ctrl.setProject(lastProject)
        registerSnapshot(ctrl.snapshot)
      })
      .catch(() => {
        if (cancelled) return
        ctrl?.dispose()
        ctrl = null
        fail()
      })

    return () => {
      cancelled = true
      window.removeEventListener('blobview', onView)
      window.removeEventListener('blobproject', onProject)
      window.removeEventListener('blobcluster', onCluster)
      window.removeEventListener('blobshape', onShape)
      registerSnapshot(null)
      ctrl?.dispose()
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {failed && (
        <div className="absolute inset-0">
          <div className="absolute left-[4%] top-[12%] h-[22vmin] w-[26vmin] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f4fffa,#a8ecc9_40%,#bfe6f2)]" />
          <div className="absolute right-[6%] top-[8%] h-[19vmin] w-[22vmin] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff5f5,#f7c0c4_40%,#ffd9ac)]" />
          <div className="absolute bottom-[8%] left-[10%] h-[23vmin] w-[28vmin] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f8f5ff,#cabdf2_40%,#bcd0f6)]" />
        </div>
      )}
      {/* Velo del color de papel: opaca el fondo en el detalle y en modo reclutador. */}
      <div ref={veilRef} className="absolute inset-0" style={{ opacity: 0, backgroundColor: 'rgb(var(--paper))' }} />
    </div>
  )
}
