'use client';

import React, { useState, useRef } from 'react';
import { api, UploadResponse, Post } from '../lib/api';
import { useOptionalChildContext } from '../lib/child-context';

interface UploadComponentProps {
  familyId?: number | null;
  onUploadSuccess?: (post: Post) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function UploadComponent({
  familyId,
  onUploadSuccess,
  onUploadError,
  className = ''
}: UploadComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState<'family_only' | 'family_and_connections'>('family_and_connections');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const childContext = useOptionalChildContext();
  const currentActingUser = childContext?.getCurrentActingUser();

  const isFamilyReady = typeof familyId === 'number';

  const ensureFamilyId = (): number | null => {
    if (typeof familyId !== 'number') {
      onUploadError?.('Your family space is still loading. Please try again in a moment.');
      return null;
    }

    return familyId;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    validateAndUpload(file);
  };

  const validateAndUpload = async (file: File) => {
    const resolvedFamilyId = ensureFamilyId();
    if (resolvedFamilyId === null) return;

    // Validate file type - be more inclusive for mobile devices
    const validImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/heic', 'image/heif', 'image/bmp', 'image/tiff'
    ];
    const validVideoTypes = [
      'video/mp4', 'video/webm', 'video/mov', 'video/quicktime',
      'video/avi', 'video/m4v', 'video/3gpp', 'video/3gpp2', 'video/mpeg'
    ];

    const normalizedType = (file.type || '').toLowerCase();
    let mediaKind: 'image' | 'video' | null = null;

    if (normalizedType) {
      if (normalizedType.startsWith('image/')) {
        mediaKind = 'image';
      } else if (normalizedType.startsWith('video/')) {
        mediaKind = 'video';
      } else if (validImageTypes.includes(normalizedType)) {
        mediaKind = 'image';
      } else if (validVideoTypes.includes(normalizedType)) {
        mediaKind = 'video';
      }
    }

    if (!mediaKind) {
      // Try to detect by file extension as fallback for iOS devices
      const fileName = (file.name || '').toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff'];
      const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v', '.3gp', '.3g2', '.mpg', '.mpeg'];

      const hasImageExt = imageExtensions.some(ext => fileName.endsWith(ext));
      const hasVideoExt = videoExtensions.some(ext => fileName.endsWith(ext));

      if (hasImageExt) {
        mediaKind = 'image';
      } else if (hasVideoExt) {
        mediaKind = 'video';
      }
    }

    if (!mediaKind) {
      // Some mobile browsers provide empty MIME types and filenames without extensions.
      // Assume the file is valid since the input accept attribute already filters options.
      if (!normalizedType && !file.name) {
        mediaKind = 'image';
      } else {
        onUploadError?.('Please select a valid image or video file. Supported formats: JPEG, PNG, GIF, WebP, HEIC, MP4, MOV, and more.');
        return;
      }
    }

    // Validate file size (150MB limit)
    const maxSize = 150 * 1024 * 1024; // 150MB in bytes
    if (file.size > maxSize) {
      onUploadError?.('File size must be less than 150MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload media to Vercel Blob
      const uploadResponse: UploadResponse = await api.uploadMedia(file);
      setUploadProgress(100);

      // Create post with media
      const defaultPostContent = mediaKind === 'image' ? 'Shared a photo' : 'Shared a video';
      const createdPost = await api.createPost({
        content: postContent.trim() || defaultPostContent,
        familyId: resolvedFamilyId.toString(),
        authorId: api.currentUser?.id || 'current-user',
        visibility,
        actingAsChild: childContext?.selectedChild || undefined,
        media: {
          type: mediaKind,
          url: uploadResponse.url,
          alt: mediaKind === 'image' ? 'Image upload' : 'Video upload'
        }
      });

      onUploadSuccess?.(createdPost);
      setPostContent('');

    } catch (error) {
      console.error('Upload failed:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const triggerFileSelect = () => {
    if (!isFamilyReady) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleMobileFileSelect = () => {
    // For mobile file selection - create a comprehensive input
    const mobileInput = document.createElement('input');
    mobileInput.type = 'file';
    mobileInput.accept = 'image/*,video/*,.heic,.heif';
    mobileInput.multiple = false;
    mobileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileSelect(target.files);
      }
    };
    mobileInput.click();
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Posting As Indicator */}
      {childContext?.isActingAsChild && currentActingUser && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: currentActingUser.avatarColor }}
          >
            {currentActingUser.avatarUrl ? (
              <img 
                src={currentActingUser.avatarUrl} 
                alt={currentActingUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              currentActingUser.name
                .split(' ')
                .map((part) => part[0])
                .join('')
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Posting as {currentActingUser.name}
            </p>
            <p className="text-xs text-blue-700">
              Others will see this post is from {currentActingUser.name}
            </p>
          </div>
        </div>
      )}

      {/* Post content input */}
      <div className="mb-4">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's happening in your family?"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Visibility toggle */}
      <div className="mb-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Share with:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setVisibility('family_and_connections')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visibility === 'family_and_connections'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Family & Connections
          </button>
          <button
            onClick={() => setVisibility('family_only')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visibility === 'family_only'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Family Only
          </button>
        </div>
      </div>

      {/* Upload area - hide drop zone on mobile, show simplified upload button */}
      <div className="hidden md:block">
        <div
          className={`upload-dropzone p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'dragover' : ''
          } ${uploading || !isFamilyReady ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.heic,.heif"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-4">
              <div className="loading-spinner mx-auto"></div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Drop photos or videos here</p>
                <p className="text-gray-500 text-sm">or click to browse (max 150MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile simplified upload button */}
      <div className="md:hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.heic,.heif"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4 py-6">
            <div className="loading-spinner mx-auto"></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-center">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <button
            onClick={triggerFileSelect}
            disabled={!isFamilyReady}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Add Photo or Video</span>
          </button>
        )}
      </div>

      {/* Post without media button */}
      {postContent.trim() && !uploading && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={async () => {
              if (!postContent.trim()) return;

              const resolvedFamilyId = ensureFamilyId();
              if (resolvedFamilyId === null) return;

              setUploading(true);
              try {
                const createdPost = await api.createPost({
                  content: postContent.trim(),
                  familyId: resolvedFamilyId.toString(),
                  authorId: api.currentUser?.id || 'current-user',
                  visibility,
                  actingAsChild: childContext?.selectedChild || undefined,
                });
                onUploadSuccess?.(createdPost);
                setPostContent('');
              } catch (error) {
                onUploadError?.(error instanceof Error ? error.message : 'Failed to create post');
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      )}

      {!isFamilyReady && (
        <p className="mt-4 text-sm text-gray-500">
          Preparing your family space&hellip; uploads will be available shortly.
        </p>
      )}
    </div>
  );
}
