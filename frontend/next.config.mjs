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
    // For Docker Swarm: use the service name directly
    // This will be overridden by API_PROXY_URL env var at runtime in client.ts
    // For local dev, this defaults to localhost:8000
    const apiUrl = process.env.API_PROXY_URL || 'http://localhost:8000';

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
