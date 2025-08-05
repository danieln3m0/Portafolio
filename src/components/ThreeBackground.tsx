'use client'

import { useRef } from 'react'
import { useThreeScene } from '@/hooks/useThreeScene'
import LoadingIndicator from './LoadingIndicator'

interface ThreeBackgroundProps {
  currentSection: string
}

export default function ThreeBackground({ currentSection }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isLoading, error } = useThreeScene(containerRef, currentSection)

  // Debug: log cuando cambia la sección en el componente
  console.log('🎭 ThreeBackground recibió sección:', currentSection);

  if (error) {
    console.error('Error en escena 3D:', error)
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed inset-0"
        style={{ 
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      <LoadingIndicator isLoading={isLoading} />
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-900 text-white p-2 rounded text-sm z-50">
          Error 3D: {error}
        </div>
      )}
    </>
  )
}
