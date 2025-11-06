'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  currentAvatarColor: string;
  userName: string;
  onUploadSuccess: (avatarUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  currentAvatarColor, 
  userName, 
  onUploadSuccess, 
  onError,
  disabled = false
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (disabled || !files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('Avatar image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Get token from localStorage directly
      const token = typeof window !== 'undefined' ? localStorage.getItem('kinjar-auth-token') : null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kinjar-api.fly.dev'}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.avatarUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      onError(err instanceof Error ? err.message : 'Failed to upload avatar');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      <div 
        className={`relative w-24 h-24 rounded-full overflow-hidden ${disabled ? 'cursor-default' : 'cursor-pointer'} group`}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
      >
        {previewUrl || currentAvatarUrl ? (
          <img
            src={previewUrl || currentAvatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-3xl font-semibold"
            style={{ backgroundColor: currentAvatarColor }}
          >
            {getInitials()}
          </div>
        )}

        {/* Overlay on hover */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {!disabled && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
}
