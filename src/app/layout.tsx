import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Francis Daniel Mamani Silva - Portfolio',
  description: 'Portafolio personal de Francis Daniel Mamani Silva - Estudiante de Ingeniería de Software en UPC y Full Stack Developer',
  keywords: 'francis daniel, mamani silva, ingeniería software, upc, lima perú, full stack developer, react, next.js, spring boot, java, python',
  authors: [{ name: 'Francis Daniel Mamani Silva' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
