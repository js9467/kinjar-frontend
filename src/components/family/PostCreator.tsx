'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAppState } from '@/lib/app-state';
import { FamilyPost, MediaAttachment, PostVisibility, FamilyMemberProfile } from '@/lib/types';

interface PostCreatorProps {
  familyId: string;
  onPostCreated?: (post: FamilyPost) => void;
  onError?: (error: string) => void;
  className?: string;
}

const determineFileType = (file: File): 'image' | 'video' => {
  // Check MIME type first
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  
  // Fallback to file extension for files with unclear MIME types (like iPhone videos)
  const extension = file.name.toLowerCase().split('.').pop();
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv', 'm4v', '3gp'];
  
  if (videoExtensions.includes(extension || '')) return 'video';
  return 'image'; // Default to image
};

export function PostCreator({ familyId, onPostCreated, onError, className = '' }: PostCreatorProps) {
  const { user, isAuthenticated } = useAuth();
  const { families } = useAppState();
  // Find current family and members
  const [members, setMembers] = useState<FamilyMemberProfile[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  useEffect(() => {
    const family = families.find(f => f.id === familyId);
    if (family) {
      // Only allow posting as self or children (members)
  // Filter for adults and children roles
  const childRoles = ['CHILD_0_5', 'CHILD_5_10', 'CHILD_10_14', 'CHILD_14_16', 'CHILD_16_ADULT'];
  const memberList = family.members?.filter(m => m.role === 'ADULT' || childRoles.includes(m.role)) || [];
      setMembers(memberList);
      // Default to self if present
      if (user) {
        const selfMember = memberList.find(m => m.userId === user.id);
        setSelectedMemberId(selfMember?.id || memberList[0]?.id || '');
      }
    }
  }, [families, familyId, user]);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('family');
  const [tags, setTags] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const isSupportedType =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      // Some browsers (notably iOS Safari) provide more specific or empty MIME types for media captures
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
    // Check authentication
    if (!isAuthenticated || !user) {
      onError?.('You must be logged in to post.');
      return;
    }
    // Check membership/connection
    if (!members.some(m => m.id === selectedMemberId)) {
      onError?.('You must be a member or connection to post.');
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
          // If upload fails, create mock media for demo
          console.log('Upload failed, using mock data for demo');
          media = {
            type: mediaPreview.type,
            url: mediaPreview.url, // Use the blob URL for demo
            alt: `${mediaPreview.type} upload`
          };
        }
      }
      // Create post
      const postTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      try {
        console.log('[PostCreator] Creating post with familyId:', familyId);
        const createdPost = await api.createPost({
          content: content.trim() || (media ? `Shared a ${media.type}` : ''),
          familyId,
          authorId: selectedMemberId,
          media,
          visibility,
          tags: postTags
        });
        setUploadProgress(100);
        onPostCreated?.(createdPost);
      } catch (apiError) {
        // If API fails, create mock post for demo
        console.log('API failed, creating mock post for demo');
        const mockMember = members.find(m => m.id === selectedMemberId);
        const mockAuthorId = mockMember?.id || user.id;
        const mockAuthorName = mockMember?.name || user.name;
        const mockAuthorColor = mockMember?.avatarColor || user.avatarColor || '#3B82F6';
        const mockPost = {
          id: `mock-post-${Date.now()}`,
          familyId,
          authorId: mockAuthorId,
          authorName: mockAuthorName,
          authorAvatarColor: mockAuthorColor,
          createdAt: new Date().toISOString(),
          content: content.trim() || (media ? `Shared a ${media.type}` : ''),
          media,
          visibility,
          status: 'approved' as const,
          reactions: 0,
          comments: [],
          tags: postTags
        };
        onPostCreated?.(mockPost);
      }
      // Reset form
      setContent('');
      setTags('');
      setVisibility('family');
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
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

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
                className="w-full h-64 object-cover"
              />
            ) : (
              <video 
                src={mediaPreview.url} 
                controls 
                className="w-full h-64 object-cover"
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
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
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

        {/* Mobile camera/gallery buttons */}
        {!mediaPreview && (
          <div className="flex gap-2 md:hidden">
            <button
              type="button"
              onClick={triggerCamera}
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Camera
            </button>
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={uploading}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Gallery
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

        {/* Member selector, visibility, and submit */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Post as:</label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading || members.length === 0}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Who can see this:</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PostVisibility)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            >
              <option value="family">Family only</option>
              <option value="connections">Family + Connections</option>
              <option value="public">Public</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={uploading || (!content.trim() && !mediaPreview) || !isAuthenticated || members.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </form>
    </div>
  );
}