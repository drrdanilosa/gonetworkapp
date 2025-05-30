const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Sempre desabilitar PWA durante build do Tauri
  disable: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração simples para Tauri
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurações experimentais
  experimental: {
    optimizeCss: true,
  },
}

module.exports = withPWA(nextConfig)
