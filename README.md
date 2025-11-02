# Kinjar - Family Photo Sharing Platform

A secure, family-focused photo sharing application built with Next.js 14, designed to help families organize and share their precious memories.

## 🌟 Features

- **Family-Based Authentication**: Secure login system with family codes
- **Photo Upload & Storage**: Direct integration with Vercel Blob storage
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Real-time Updates**: Modern React-based interface with instant feedback
- **File Size Management**: Intelligent handling of photo uploads up to 800KB
- **Secure Access**: Family-specific access control and data isolation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for Blob storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kinjar-frontend-fresh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and update the following variables:
   
   ```env
   # Kinjar API Configuration
   NEXT_PUBLIC_API_BASE=https://kinjar-api.fly.dev
   
   # NextAuth Configuration  
   NEXTAUTH_SECRET=your-secure-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Kinjar Family Photos
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Vercel Blob Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage > Create > Blob
3. Copy your `BLOB_READ_WRITE_TOKEN`
4. Add it to your `.env.local` file

### Authentication Setup

The app integrates with the Kinjar API for authentication. Each family has:
- A unique family slug (family code)
- A shared family password
- Isolated photo storage and access

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth.js configuration
│   │   └── upload/                 # File upload API route
│   ├── auth/signin/                # Authentication page
│   ├── family/[slug]/              # Family-specific photo pages
│   ├── layout.tsx                  # Root layout with providers
│   ├── page.tsx                    # Home page (redirects to auth)
│   └── providers.tsx               # Session provider wrapper
├── lib/
│   └── upload.ts                   # Upload utility functions
└── types/
    └── next-auth.d.ts             # TypeScript declarations for NextAuth
```

## 🔒 Security Features

- **Family Isolation**: Each family can only access their own photos
- **Secure Authentication**: Integration with Kinjar API for user verification
- **File Validation**: Client and server-side file type and size validation
- **CORS Protection**: Properly configured cross-origin request handling

## 📱 Usage

### For Families

1. **Sign In**: Use your family code and password
2. **Upload Photos**: Click "Upload Photos" and select your images
3. **View Gallery**: Browse your family's photo collection
4. **File Limits**: Keep photos under 800KB for best performance

### For Administrators

- Family codes and passwords are managed through the Kinjar API
- Storage is automatically organized by family and upload type
- All photos are stored securely in Vercel Blob storage

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Storage**: Vercel Blob
- **Deployment**: Vercel (recommended)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
NEXT_PUBLIC_API_BASE=https://kinjar-api.fly.dev
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
NEXT_PUBLIC_APP_NAME=Kinjar Family Photos
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software for the Kinjar family photo platform.

## 🔧 Troubleshooting

### Common Issues

**Upload fails with "net::ERR_FAILED"**
- Check that BLOB_READ_WRITE_TOKEN is set correctly
- Verify file is under 800KB
- Ensure stable internet connection

**Authentication not working**
- Verify NEXT_PUBLIC_API_BASE points to correct Kinjar API
- Check family code and password are correct
- Confirm NEXTAUTH_SECRET is set

**Development server won't start**
- Check Node.js version (18+ required)
- Clear node_modules and reinstall dependencies
- Verify all environment variables are set

## 📞 Support

For technical support or questions about family access, contact your family administrator or the Kinjar support team.
