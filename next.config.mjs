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
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
  },
  serverExternalPackages: ['@neondatabase/serverless'],
}

export default nextConfig
