const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Sempre desabilitar PWA durante build do Tauri
  disable: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Tauri - export estático sem páginas dinâmicas
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Necessário para Tauri e export estático
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  
  // Desabilitar geração de API routes
  generateBuildId: () => 'tauri-build',

  // Configurações experimentais simplificadas
  experimental: {
    optimizeCss: true,
  },

  webpack: (config, { isServer }) => {
    // Configurações básicas do webpack
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }

    // Excluir páginas dinâmicas problemáticas
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app/eventos/[eventId]/aprovacao/page': false,
      '@/app/eventos/[eventId]/gerenciar/page': false,
    }

    return config
  },
}

module.exports = withPWA(nextConfig)
