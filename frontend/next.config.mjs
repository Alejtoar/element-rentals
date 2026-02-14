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
    // Environment variables are not available at build time in Dokploy
    // So we hardcode the service name for production
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'http://elementrentals-elementbackend-cuguqz:8000'
      : (process.env.API_PROXY_URL || 'http://localhost:8000');

    console.log('[next.config.mjs] NODE_ENV:', process.env.NODE_ENV);
    console.log('[next.config.mjs] API_PROXY_URL:', apiUrl);

    return [
      // Handle paths without trailing slash by adding it
      {
        source: '/api/v1/:path((?!.*/).*)',
        destination: `${apiUrl}/api/v1/:path/`,
      },
      // Handle paths with trailing slash as-is
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
