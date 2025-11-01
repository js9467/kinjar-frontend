# Kinjar Frontend Rebuild Instructions

## Step 1: Install Node.js (if not already installed)
Download and install Node.js from: https://nodejs.org/
Choose the LTS version (recommended)

## Step 2: Open a new PowerShell/Command Prompt window
After installing Node.js, close and reopen your terminal to refresh the PATH

## Step 3: Navigate to the frontend directory
```powershell
cd "d:\Software\Kinjar Frontend\kinjar-frontend"
```

## Step 4: Install dependencies
```powershell
npm install
```

## Step 5: Run development server (recommended for testing)
```powershell
npm run dev
```
This will start the development server on http://localhost:3000

## Step 6: Or build for production
```powershell
npm run build
npm start
```

## What Our Fixes Address:
✅ React Hydration Errors (#418, #423, #425)
✅ Improved upload error handling with better CORS diagnostics
✅ Separated main page from family functionality
✅ Added debugging output for upload issues

## Testing the Fixes:
1. Load the main page - should have no React errors
2. Try uploading a file - console will show detailed CORS/network information
3. Check browser console for clearer error messages

## If Upload Still Fails:
The console will now show:
- Your frontend domain/origin
- Exact CORS error details
- File size and timeout information
- Whether it's a network, CORS, or server issue