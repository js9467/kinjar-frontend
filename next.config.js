/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Disable static generation for problematic pages
  generateBuildId: async () => {
    return 'kinjar-build-' + Date.now()
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-api-key, x-tenant-slug',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;