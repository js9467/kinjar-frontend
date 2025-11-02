# Kinjar Family Photo Sharing Platform

## Project Overview

This is a Next.js 14 application for secure family photo sharing. The platform allows families to authenticate with family codes and upload/view photos in a secure, isolated environment.

## Key Technologies

- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: NextAuth.js with custom credentials provider
- **Storage**: Vercel Blob for secure photo storage
- **API Integration**: Kinjar API for family authentication

## Architecture

### Authentication Flow
1. Families authenticate using family slug and password
2. NextAuth.js handles session management
3. Family-specific routing to `/family/[slug]` pages
4. Secure access control for family data isolation

### Upload System
- Direct upload to Vercel Blob storage
- File size validation (800KB limit)
- Automatic organization by family and upload type
- Real-time progress feedback

### File Structure
- `/api/auth/[...nextauth]` - Authentication configuration
- `/api/upload` - File upload API route
- `/auth/signin` - Authentication page
- `/family/[slug]` - Family-specific photo galleries
- `/lib/upload.ts` - Upload utility functions

## Development Guidelines

### Code Patterns
- Use TypeScript for all components and utilities
- Implement proper error handling and loading states
- Follow React best practices with hooks and state management
- Use Tailwind classes for consistent styling

### Security Considerations
- Always validate family access in server components
- Sanitize file uploads and validate file types
- Use proper CORS headers for API routes
- Implement proper session management

### Environment Variables
Required for development and production:
- `NEXT_PUBLIC_API_BASE` - Kinjar API endpoint
- `NEXTAUTH_SECRET` - Session encryption secret
- `NEXTAUTH_URL` - Application URL
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

## API Integration

### Kinjar API Endpoints
- `POST /auth/login` - Family authentication
- Family data is managed through the external Kinjar API

### Internal API Routes
- `POST /api/upload` - Handle file uploads to Vercel Blob
- `GET /api/auth/[...nextauth]` - NextAuth.js endpoints

## Testing & Deployment

### Local Development
1. Install dependencies with `npm install`
2. Set up environment variables in `.env.local`
3. Run development server with `npm run dev`
4. Access at `http://localhost:3000`

### Production Deployment
- Recommended: Vercel platform for seamless integration
- Ensure all environment variables are configured
- Build process validates TypeScript and generates optimized bundle

## Troubleshooting

### Common Issues
- Upload failures: Check Blob token and file size limits
- Authentication issues: Verify API endpoint and family credentials
- Build errors: Ensure TypeScript types are properly defined

### Performance Optimization
- Images are automatically optimized through Vercel Blob
- File size limits prevent performance issues
- Lazy loading implemented for photo galleries

## Contributing

When contributing to this project:
1. Follow TypeScript best practices
2. Test upload functionality thoroughly
3. Ensure responsive design works on all devices
4. Validate security measures for family data isolation
5. Update documentation for any new features