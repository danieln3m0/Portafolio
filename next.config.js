/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Configuración para GitHub Pages
  // basePath: '/Portafolio',
  // assetPrefix: '/Portafolio/',
  // Optimizaciones para producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración para mejor compatibilidad
  reactStrictMode: true,
  poweredByHeader: false,
}

module.exports = nextConfig
