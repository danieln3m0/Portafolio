/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Optimizaciones para producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración para mejor compatibilidad
  reactStrictMode: true,
  poweredByHeader: false,
}

module.exports = nextConfig
