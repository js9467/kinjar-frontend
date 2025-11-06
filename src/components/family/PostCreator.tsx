'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAppState } from '@/lib/app-state';
import { useOptionalChildContext } from '@/lib/child-context';
import { useTheme } from '@/lib/theme-context';
import { FamilyPost, MediaAttachment, PostVisibility, FamilyMemberProfile } from '@/lib/types';

interface PostCreatorProps {
  familyId: string;
  familySlug?: string;
  initialMembers?: FamilyMemberProfile[];
  onPostCreated?: (post: FamilyPost) => void;
  onError?: (error: string) => void;
  className?: string;
}

const determineFileType = (file: File): 'image' | 'video' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  
  const extension = file.name.toLowerCase().split('.').pop();
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv', 'm4v', '3gp'];
  
  if (videoExtensions.includes(extension || '')) return 'video';
  return 'image';
};

// Function to calculate age from birthdate
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export function PostCreator({ familyId, familySlug, initialMembers = [], onPostCreated, onError, className = '' }: PostCreatorProps) {
  const { user, isAuthenticated } = useAuth();
  const { families } = useAppState();
  const childContext = useOptionalChildContext();
  const { currentTheme } = useTheme();

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('family_and_connections');
  const [tags, setTags] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.accept = 'image/*,video/*';
    }
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const isSupportedType =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      ['image/heic', 'image/heif', 'video/quicktime', ''].includes(file.type);
    
    if (!isSupportedType) {
      onError?.(
        'Please select a valid image or video file (JPEG, PNG, GIF, WebP, HEIC, MP4, MOV, and similar formats)'
      );
      return;
    }

    // Validate file size (150MB limit)
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.('File size must be less than 150MB');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    const type = determineFileType(file);
    setMediaPreview({ file, url, type });
  };

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      onError?.('You must be logged in to post.');
      return;
    }
    
    // Check if we have a valid selection (child context or local selection)
    const hasValidSelection = true; // With child context, we always have a valid selection
    if (!hasValidSelection) {
      onError?.('Please select who you\'re posting as.');
      return;
    }
    
    if (!content.trim() && !mediaPreview) {
      onError?.('Please add some content or media to your post');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let media: MediaAttachment | undefined;
      
      // Upload media if present
      if (mediaPreview) {
        setUploadProgress(25);
        try {
          const uploadResponse = await api.uploadMedia(mediaPreview.file);
          setUploadProgress(75);
          media = {
            type: mediaPreview.type,
            url: uploadResponse.url,
            alt: `${mediaPreview.type} upload`
          };
        } catch (uploadError) {
          console.error('Media upload failed:', uploadError);
          throw new Error('Failed to upload media. Please try again.');
        }
      }

      // Create post
      const postTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Use child context if available, otherwise fall back to local selection
      const actingChild = childContext?.selectedChild;
      const selectedMember = actingChild || user;
      
      // Always use the logged-in user's ID as the author_id for the database
      // The selected member/child info is for display purposes only
      const authorId = user.id;
      
      console.log('[PostCreator] Creating post with:');
      console.log('  Family ID:', familyId);
      console.log('  Author ID (logged-in user):', authorId);
      console.log('  Acting as child:', actingChild?.name);
      console.log('  Posting as member:', selectedMember?.name);
      console.log('  Selected member ID:', selectedMember?.id);
      console.log('  Using child context:', !!actingChild);
      console.log('  Visibility:', visibility);
      
      const createdPost = await api.createPost({
        content: content.trim() || (media ? `Shared a ${media.type}` : ''),
        familyId,
        authorId,
        media,
        visibility,
        tags: postTags,
        // Use postedAsMember for backwards compatibility if not using child context
        postedAsMember: !actingChild && selectedMember ? {
          id: selectedMember.id,
          name: selectedMember.name,
          role: 'role' in selectedMember ? selectedMember.role : 'ADULT'
        } : undefined
      });
      
      setUploadProgress(100);
      onPostCreated?.(createdPost);
      
      // Reset form
      setContent('');
      setTags('');
      setVisibility('family_and_connections');
      clearMedia();
      
    } catch (error) {
      console.error('Post creation failed:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to create post');
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
    if (fileInputRef.current) {
      // For mobile devices, allow access to camera, video camera, and photo library
      fileInputRef.current.accept = 'image/*,video/*';
      fileInputRef.current.removeAttribute('capture'); // Remove capture to allow gallery access
      fileInputRef.current.click();
    }
  };

  // Show authentication required if not logged in
  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 text-center text-gray-500">
          Please log in to create posts.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Content input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your family?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* Media preview */}
        {mediaPreview && (
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            {mediaPreview.type === 'image' ? (
              <img
                src={mediaPreview.url}
                alt="Upload preview"
                className="w-full h-48 sm:h-64 object-cover"
              />
            ) : (
              <video
                src={mediaPreview.url}
                controls
                className="w-full h-48 sm:h-64 object-cover"
              />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Media upload area */}
        {!mediaPreview && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              uploading ? 'pointer-events-none opacity-50' : ''
            }`}
            style={{
              borderColor: dragOver ? currentTheme.color : '#D1D5DB',
              backgroundColor: dragOver ? currentTheme.color + '10' : 'transparent'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Drop photos or videos here, or click to browse</p>
            <p className="text-xs text-gray-500">Max 150MB • JPEG, PNG, GIF, WebP, MP4, WebM, MOV</p>
          </div>
        )}

        {/* Mobile upload button */}
        {!mediaPreview && (
          <div className="md:hidden">
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Photo or Video</span>
            </button>
          </div>
        )}

        {/* Tags input */}
        <div>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add tags (comma-separated)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">Example: birthday, vacation, milestone</p>
        </div>

        {/* Visibility and submit */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700">Who can see this:</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PostVisibility)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            >
              <option value="family_and_connections">Family & Connections</option>
              <option value="family_only">Family Only</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={uploading || (!content.trim() && !mediaPreview) || !isAuthenticated}
            className="text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto transition-colors"
            style={{
              backgroundColor: currentTheme.color,
              '&:hover': { backgroundColor: currentTheme.color + 'CC' }
            } as any}
            onClick={() => {
              console.log('[PostCreator] Submit button clicked - Debug info:');
              console.log('  uploading:', uploading);
              console.log('  content.trim():', content.trim());
              console.log('  mediaPreview:', !!mediaPreview);
              console.log('  isAuthenticated:', isAuthenticated);
              console.log('  childContext?.selectedChild:', childContext?.selectedChild?.name);
              console.log('  Using child context:', !!childContext?.selectedChild);
              console.log('  User authenticated:', isAuthenticated);
            }}
          >
            {uploading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${uploadProgress}%`,
                backgroundColor: currentTheme.color
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
}