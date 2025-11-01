# Next.js Configuration with CORS handling

## Development Setup

This configuration helps with CORS issues during development.

### Option 1: Use Next.js Rewrites for CORS (Recommended for Development)

Add this to your `next.config.js` to proxy API requests during development:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Option 2: Set Environment Variable for Development

Add to `.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:3000/api/proxy
```

This will route all API calls through Next.js which handles CORS automatically.

### Option 3: API Server CORS Configuration

The API server needs to allow `http://localhost:3000` in its CORS configuration.

Add to the API server's environment variables:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Current Issue Analysis

The error "Failed to fetch" typically indicates:
1. CORS policy blocking the request
2. Network connectivity issues  
3. Server not responding
4. Large file upload timeout

Based on the console logs, the health check succeeds but the upload fails, which suggests CORS preflight issues specifically with the POST request to `/upload`.