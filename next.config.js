/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Disable minification in development to avoid React errors
    webpack: (config, { dev, isServer }) => {
      if (dev) {
        // Disable minification for better error messages
        config.optimization.minimize = false;
      }
      return config;
    },
    // Better error handling
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
  
  // Enable CORS handling in development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: 'https://kinjar-api.fly.dev/:path*',
        },
      ];
    }
    return [];
  },
  
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
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
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  
  // Better error pages
  ...(process.env.NODE_ENV === 'development' && {
    compress: false,
  }),
};

module.exports = nextConfig;