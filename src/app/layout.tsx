import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

// Tipografía geométrica única: Outfit. Pesos ligeros (200/300) para el cuerpo
// y descripciones, pesos fuertes (700/800) en mayúsculas para los titulares.
const sans = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-sans',
})

const siteUrl = 'https://danieln3m0.github.io/Portafolio'
const title = 'Francis Daniel Mamani Silva · Desarrollador Full-Stack & Creative Coding'
const description =
  'Portafolio de Francis Daniel Mamani Silva. Materializo formas con código: interfaces, sistemas y experiencias web construidas con React, Next.js, Java y Python.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Francis Daniel Mamani Silva',
  },
  description,
  keywords: [
    'Francis Daniel Mamani Silva',
    'desarrollador full stack',
    'front-end',
    'creative coding',
    'ingeniería de software',
    'UPC',
    'Lima Perú',
    'React',
    'Next.js',
    'TypeScript',
  ],
  authors: [{ name: 'Francis Daniel Mamani Silva', url: siteUrl }],
  creator: 'Francis Daniel Mamani Silva',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: siteUrl,
    siteName: 'Francis Daniel Mamani Silva',
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
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f2ec',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
