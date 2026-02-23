/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.elemntrentals.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    // We use API_PROXY_URL to point to the backend service.
    // In Dokploy, set this as an environment variable (both for Build and Runtime if possible).
    // Example: http://elementrentals-elementbackend-cuguqz:8000
    const apiUrl = process.env.API_PROXY_URL || 'http://localhost:8000';

    console.log('[next.config.mjs] Using API_PROXY_URL:', apiUrl);

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
