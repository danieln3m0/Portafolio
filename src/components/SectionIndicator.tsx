'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionIndicatorProps {
  currentSection: string
}

const sectionNames: Record<string, string> = {
  hero: '🏠 Inicio',
  about: '👤 Sobre mí',
  experience: '💼 Experiencia',
  education: '🎓 Educación',
  skills: '🛠️ Habilidades',
  projects: '🚀 Proyectos',
  certifications: '📜 Certificaciones',
  contact: '📬 Contacto'
}

export default function SectionIndicator({ currentSection }: SectionIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (currentSection) {
      setIsVisible(true)
      const timer = setTimeout(() => setIsVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [currentSection])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-8 left-8 z-40 pointer-events-none"
        >
          <div className="glass px-4 py-3 rounded-lg backdrop-blur-md">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-white font-medium text-sm">
                {sectionNames[currentSection] || currentSection}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
