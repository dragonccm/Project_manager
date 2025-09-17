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
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  serverExternalPackages: ['mongoose'],
  // Enhanced UTF-8 support for Vietnamese characters
  // Remove deprecated experimental.serverComponentsExternalPackages
  // Ensure proper character encoding
  compress: true,
  poweredByHeader: false,
  // Add proper headers for UTF-8
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ]
  },
}

export default nextConfig
