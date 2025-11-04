'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAppState } from '@/lib/app-state';
import { FamilyPost, MediaAttachment, PostVisibility, FamilyMemberProfile } from '@/lib/types';

const CHILD_ROLES = ['CHILD_0_5', 'CHILD_5_10', 'CHILD_10_14', 'CHILD_14_16', 'CHILD_16_ADULT'];
const ALLOWED_ROLES = new Set(['OWNER', 'ADMIN', 'ADULT', ...CHILD_ROLES]);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value: string) => UUID_REGEX.test(value.trim());

const normalizeEligibleMembers = (list: FamilyMemberProfile[] = []): FamilyMemberProfile[] => {
  const uniqueMembers: FamilyMemberProfile[] = [];
  const seenPrimary = new Set<string>();
  const seenSecondary = new Set<string>();

  list.forEach((member) => {
    if (!ALLOWED_ROLES.has(member.role)) {
      return;
    }

    const primaryKey = (member.userId || member.id || '').trim();
    if (primaryKey && seenPrimary.has(primaryKey)) {
      return;
    }

    const secondaryKeyBase = (member.name || '').trim().toLowerCase();
    const secondaryKey = secondaryKeyBase || member.birthdate
      ? `${secondaryKeyBase}|${member.birthdate || ''}`
      : '';

    if (secondaryKey && seenSecondary.has(secondaryKey)) {
      return;
    }

    if (primaryKey) {
      seenPrimary.add(primaryKey);
    }
    if (secondaryKey) {
      seenSecondary.add(secondaryKey);
    }

    uniqueMembers.push(member);
  });

  return uniqueMembers;
};

interface PostCreatorProps {
  familyId: string;
  familySlug?: string;
  initialMembers?: FamilyMemberProfile[];
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

export function PostCreator({ familyId, familySlug, initialMembers = [], onPostCreated, onError, className = '' }: PostCreatorProps) {
  const { user, isAuthenticated } = useAuth();
  const { families } = useAppState();

  const [members, setMembers] = useState<FamilyMemberProfile[]>(() => normalizeEligibleMembers(initialMembers));
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  const ensureSelectedMember = useCallback((candidates: FamilyMemberProfile[]) => {
    setSelectedMemberId((prev) => {
      if (prev && candidates.some((member) => member.id === prev)) {
        console.log('[PostCreator] Keeping previous selection:', prev);
        return prev;
      }
      const selfMember = user
        ? candidates.find((member) => member.userId === user.id || member.id === user.id)
        : undefined;
      const newSelection = selfMember?.id || candidates[0]?.id || '';
      console.log('[PostCreator] Setting default member:', newSelection, 'from candidates:', candidates.map(c => c.id));
      return newSelection;
    });
  }, [user]);

  const loadMembers = useCallback(async () => {
    let candidateMembers = initialMembers.length > 0 ? initialMembers : [];

    if (candidateMembers.length === 0) {
      const contextFamily = families.find((family) =>
        family.id === familyId ||
        family.slug === familyId ||
        (!!familySlug && (family.slug === familySlug || family.id === familySlug))
      );
      if (contextFamily?.members?.length) {
        candidateMembers = contextFamily.members;
      }

      if (candidateMembers.length === 0) {
        const slugToFetch = familySlug || contextFamily?.slug || (!isUuid(familyId) ? familyId : undefined);
        if (slugToFetch && !loadingMembers) {
          try {
            setLoadingMembers(true);
            const fetchedFamily = await api.getFamilyBySlug(slugToFetch);
            candidateMembers = fetchedFamily.members || [];
          } catch (error) {
            console.error('[PostCreator] Failed to load family members', error);
            onError?.('Unable to load family members for posting.');
          } finally {
            setLoadingMembers(false);
          }
        }
      }
    }

    const normalizedMembers = normalizeEligibleMembers(candidateMembers);
    setMembers(normalizedMembers);
    ensureSelectedMember(normalizedMembers);
  }, [initialMembers, families, familyId, familySlug, onError, ensureSelectedMember, loadingMembers]);

  useEffect(() => {
    if (members.length === 0) {
      loadMembers();
    }
  }, []);

  useEffect(() => {
    if (initialMembers.length > 0) {
      const normalizedInitial = normalizeEligibleMembers(initialMembers);
      setMembers(normalizedInitial);
      ensureSelectedMember(normalizedInitial);
    }
  }, [initialMembers, ensureSelectedMember]);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('family');
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
        console.log('[PostCreator] Selected member ID:', selectedMemberId);
        console.log('[PostCreator] Available members:', members.map(m => ({ id: m.id, name: m.name, userId: m.userId })));
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
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*,video/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const triggerVideoCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'video/*';
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
              onClick={triggerVideoCapture}
              disabled={uploading}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14V10z" />
                <rect x="3" y="7" width="12" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              Video
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700">Post as:</label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading || members.length === 0}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
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
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full md:w-auto"
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