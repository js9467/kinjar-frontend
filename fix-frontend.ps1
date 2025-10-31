# Kinjar Frontend TypeScript Fix Script

Write-Host "🔧 Fixing Kinjar Frontend TypeScript Configuration..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location "d:\Software\Kinjar Frontend\kinjar-frontend"

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first:" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check TypeScript configuration
Write-Host "🔍 Checking TypeScript configuration..." -ForegroundColor Yellow

# Update tsconfig.json to fix JSX issues
$tsconfigContent = @"
{
  "compilerOptions": {
    "incremental": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["*", "src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"@

Write-Host "📝 Updating tsconfig.json..." -ForegroundColor Yellow
$tsconfigContent | Out-File -FilePath "tsconfig.json" -Encoding UTF8

# Create React types file if missing
$reactTypesContent = @"
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
"@

if (!(Test-Path "src/types/react.d.ts")) {
    Write-Host "📝 Creating React types file..." -ForegroundColor Yellow
    New-Item -Path "src/types" -ItemType Directory -Force | Out-Null
    $reactTypesContent | Out-File -FilePath "src/types/react.d.ts" -Encoding UTF8
}

# Try to start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "" 
Write-Host "If successful, your Kinjar app will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Available pages:" -ForegroundColor Cyan
Write-Host "   /login           - Login page" -ForegroundColor White
Write-Host "   /signup          - Create family account" -ForegroundColor White  
Write-Host "   /video-blog      - Main video blog interface" -ForegroundColor White
Write-Host "   /video-capture   - Video capture page" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev