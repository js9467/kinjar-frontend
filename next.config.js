/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'blob.vercel-storage.com',
      'kinjar-api.fly.dev'
    ],
  },
  async rewrites() {
    return [
      // API proxy to Fly.dev backend
      {
        source: '/api/proxy/:path*',
        destination: 'https://kinjar-api.fly.dev/api/:path*',
      },
      // Subdomain routing for families
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?<family>[^.]+)\\.kinjar\\.com',
          },
        ],
        destination: '/families/:family',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<family>[^.]+)\\.kinjar\\.com',
          },
        ],
        destination: '/families/:family/:path*',
      },
    ];
  },
  env: {
    FLY_API_KEY: process.env.FLY_API_KEY,
    FLY_BACKEND_URL: process.env.FLY_BACKEND_URL,
    KINJAR_API_URL: process.env.KINJAR_API_URL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    TENANT_BASE_DOMAIN: process.env.TENANT_BASE_DOMAIN,
  },
};

module.exports = nextConfig;