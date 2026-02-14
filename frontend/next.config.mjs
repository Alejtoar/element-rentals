/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.56.101',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.fly.dev',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    // API_PROXY_URL should point to the backend service
    // Development: http://localhost:8000
    // Production (Docker): http://elementrentals-elementbackend-[hash]:8000
    const apiUrl = process.env.API_PROXY_URL || 'http://localhost:8000';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      }
    ];
  },
};

export default nextConfig;
