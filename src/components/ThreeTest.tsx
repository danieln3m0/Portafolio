'use client'

import { useEffect, useRef } from 'react'

export default function ThreeTest() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let scene: any, camera: any, renderer: any, cube: any, animationId: number

    async function initThree() {
      try {
        console.log('ThreeTest: Importando Three.js...')
        
        // Importación dinámica para evitar problemas de SSR
        const THREE = await import('three')
        
        console.log('ThreeTest: Three.js importado, inicializando...')

        if (!mountRef.current) return

        // Crear escena básica
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x222222)

        // Crear cámara
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 5

        // Crear renderer
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.domElement.style.position = 'fixed'
        renderer.domElement.style.top = '0'
        renderer.domElement.style.left = '0'
        renderer.domElement.style.zIndex = '-1'
        renderer.domElement.style.pointerEvents = 'none'
        
        mountRef.current.appendChild(renderer.domElement)

        // Crear un cubo simple
        const geometry = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshBasicMaterial({ color: 0xff6600 })
        cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        console.log('ThreeTest: Escena creada, iniciando animación...')

        // Loop de animación
        const animate = () => {
          animationId = requestAnimationFrame(animate)
          if (cube) {
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01
          }
          if (renderer && scene && camera) {
            renderer.render(scene, camera)
          }
        }

        animate()
        console.log('ThreeTest: ¡Funcionando!')

      } catch (error) {
        console.error('ThreeTest: Error al inicializar Three.js:', error)
      }
    }

    initThree()

    // Cleanup
    return () => {
      console.log('ThreeTest: Cleanup')
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer && mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement)
          renderer.dispose()
        } catch (e) {
          console.log('Error during cleanup:', e)
        }
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  )
}
