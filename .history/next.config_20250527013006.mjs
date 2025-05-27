/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,

  // Configurações para Electron
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,

  // Configurações webpack para Electron
  webpack: (config, { isServer, dev }) => {
    // Configurações específicas para Electron
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }

    // Configurações para desenvolvimento com Electron
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    return config
  },

  // Configurações de headers para desenvolvimento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Configurações para build estático (produção)
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '',
    assetPrefix: '',
  }),
}

export default nextConfig
