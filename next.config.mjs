/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 đã bỏ key `eslint` ở đây (trước gây cảnh báo "Unrecognized key").
  // Lint chạy riêng bằng `npm run lint`.
  typescript: {
    // Build vẫn bỏ qua lỗi type — chạy `npm run typecheck` trước khi commit.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // KHÔNG khai báo MONGODB_URI trong `env`: Next.js sẽ inline giá trị này vào
  // bundle client, làm lộ credential DB ra trình duyệt. Mọi chỗ dùng biến này
  // đều là server-side (app/api/*, lib/*) nên process.env đọc trực tiếp là đủ.
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
