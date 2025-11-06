'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

export function AuthenticatedImage({ src, alt, fill, className, sizes }: AuthenticatedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a backend media URL that needs authentication
  const isBackendMedia = src.includes('/api/media/');
  
  // If it's a backend media URL, use regular img tag to bypass Next.js optimization
  // Next.js image optimization can't handle authenticated endpoints
  if (isBackendMedia) {
    return (
      <>
        {imageError ? (
          <div className={`flex items-center justify-center bg-gray-100 ${className || 'h-64 w-full'}`}>
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Image unavailable</p>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className={`flex items-center justify-center bg-gray-100 ${className || 'h-64 w-full'}`}>
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
          </>
        )}
      </>
    );
  }

  // For non-backend URLs, use Next.js Image component as normal
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={() => setImageError(true)}
    />
  );
}