# 🚀 Deploy Kinjar Family Platform to Vercel

## Quick Start for GitHub Repository: https://github.com/js9467/kinjar-frontend

This guide will help you deploy your Kinjar family platform to your existing Vercel-connected repository.

## 📁 Repository Structure (Next.js for Vercel)

Replace your current repository with this structure:

```
kinjar-frontend/
├── pages/
│   ├── api/                    # API routes
│   ├── families/
│   │   └── [family_slug]/     # Dynamic family routes
│   │       ├── index.tsx      # Family homepage
│   │       ├── admin.tsx      # Family admin
│   │       └── upload.tsx     # Mobile upload
│   ├── admin/
│   │   └── index.tsx          # Root admin
│   ├── auth/
│   │   ├── login.tsx          # Login page
│   │   └── register.tsx       # Registration
│   └── index.tsx              # Landing page
├── lib/                       # Utilities
│   ├── api.ts                # API client
│   ├── storage.ts            # Vercel Blob storage
│   └── auth.ts               # Authentication
├── components/               # React components
├── styles/                  # CSS/Tailwind
│   └── globals.css
├── public/                  # Static assets
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── vercel.json             # Vercel deployment config
```

## 🔧 Required Files

### 1. package.json
```json
{
  "name": "kinjar-frontend",
  "version": "1.0.0",
  "description": "Kinjar Family Platform - Multi-tenant family social platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@vercel/blob": "^0.15.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2. next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['blob.vercel-storage.com'],
  },
  async rewrites() {
    return [
      // Subdomain routing for families
      {
        source: '/',
        has: [{ type: 'host', value: '(?<family>[^.]+)\\.kinjar\\.com' }],
        destination: '/families/:family',
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<family>[^.]+)\\.kinjar\\.com' }],
        destination: '/families/:family/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3. vercel.json
```json
{
  "version": 2,
  "builds": [{ "src": "package.json", "use": "@vercel/next" }],
  "env": {
    "FLY_API_KEY": "@fly-api-key",
    "FLY_BACKEND_URL": "@fly-backend-url",
    "BLOB_READ_WRITE_TOKEN": "@blob-read-write-token"
  }
}
```

## ⚙️ Environment Variables in Vercel Dashboard

Set these in your Vercel project settings:

```env
# Backend API
FLY_API_KEY=23cf1b788d4d660fab55ee30d392d74ca0ec52e1c409eec31a4e18f9340f38af
FLY_BACKEND_URL=https://kinjar-api.fly.dev
KINJAR_API_URL=https://kinjar-api.fly.dev

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_ZHcVEZkPvrrn4k2C_Pinuk0x4wXUGhwjGPq1MLuwG4DGXli

# Domain Configuration
TENANT_BASE_DOMAIN=kinjar.com
NEXT_PUBLIC_BASE_URL=https://kinjar.com

# Authentication
NEXTAUTH_SECRET=your-secure-secret-key-here
NEXTAUTH_URL=https://kinjar.com
```

## 📱 Key Features

✅ **Subdomain Routing**: `slaughterbeck.kinjar.com` → Family pages  
✅ **Mobile Upload**: Camera integration for photos/videos  
✅ **Family Admin**: Settings and member management  
✅ **Root Admin**: Platform oversight dashboard  
✅ **API Integration**: Connected to Fly.dev backend  
✅ **Blob Storage**: Media uploads via Vercel Blob  

## 🚀 Deployment Steps

1. **Replace Repository Content**:
   ```bash
   # Clone and replace content in your repository
   git clone https://github.com/js9467/kinjar-frontend.git
   cd kinjar-frontend
   # Replace with Next.js files from this guide
   ```

2. **Add Required Files**:
   - Copy `nextjs-package.json` → `package.json`
   - Copy `nextjs-next.config.js` → `next.config.js`
   - Copy `nextjs-vercel.json` → `vercel.json`
   - Copy `nextjs-family-page.tsx` → `pages/families/[family_slug]/index.tsx`

3. **Configure Vercel Environment**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all environment variables listed above

4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Kinjar family platform to Vercel"
   git push origin main
   ```

5. **Vercel Auto-Deploy**:
   - Vercel will automatically detect the push and start deployment
   - Check deployment logs in Vercel dashboard

## 🔗 Post-Deployment

After successful deployment:

1. **Configure Domain**: Point `kinjar.com` and `*.kinjar.com` to Vercel
2. **Test Subdomains**: `slaughterbeck.kinjar.com`
3. **Test Upload**: Mobile photo/video upload functionality
4. **Test Admin**: Root admin dashboard access

## 📋 File Conversion Checklist

Convert these Fresh files to Next.js:

- [ ] `routes/[family_slug]/index.tsx` → `pages/families/[family_slug]/index.tsx`
- [ ] `routes/[family_slug]/admin.tsx` → `pages/families/[family_slug]/admin.tsx`
- [ ] `routes/[family_slug]/upload.tsx` → `pages/families/[family_slug]/upload.tsx`
- [ ] `routes/admin/index.tsx` → `pages/admin/index.tsx`
- [ ] `routes/index.tsx` → `pages/index.tsx`
- [ ] `utils/api.ts` → `lib/api.ts`
- [ ] `utils/storage.ts` → `lib/storage.ts`

## 🎯 Expected Results

After deployment, your platform will support:

- **Family Subdomains**: Each family gets `family.kinjar.com`
- **Mobile Uploads**: Direct camera access for photo/video sharing
- **Family Management**: Admin panels for settings and members
- **Cross-Family Connections**: Secure family-to-family sharing
- **Root Administration**: Platform-wide oversight tools

## 🚨 Troubleshooting

**Build Errors**: Check that all imports use Next.js format  
**API Errors**: Verify environment variables in Vercel  
**Domain Issues**: Configure DNS settings for subdomain routing  
**Upload Issues**: Check Vercel Blob token permissions  

Your Kinjar family platform will be live and ready for families to start sharing memories! 🎉