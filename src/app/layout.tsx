import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const siteUrl = 'https://danieln3m0.github.io/Portafolio'
const title = 'Francis Daniel Mamani Silva — Full Stack Developer'
const description =
  'Portafolio de Francis Daniel Mamani Silva, estudiante de Ingeniería de Software en UPC (17.5/20) y desarrollador Full Stack con Next.js, React, Spring Boot, Java y Python.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Francis Daniel Mamani Silva',
  },
  description,
  keywords: [
    'Francis Daniel Mamani Silva',
    'full stack developer',
    'ingeniería de software',
    'UPC',
    'Lima Perú',
    'React',
    'Next.js',
    'Spring Boot',
    'Java',
    'Python',
    'TypeScript',
  ],
  authors: [{ name: 'Francis Daniel Mamani Silva', url: siteUrl }],
  creator: 'Francis Daniel Mamani Silva',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: siteUrl,
    siteName: 'Portafolio · Francis Daniel Mamani Silva',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
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
