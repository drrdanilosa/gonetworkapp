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

    return config
  },
}

module.exports = nextConfig
