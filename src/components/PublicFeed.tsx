'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FamilyPost } from '@/lib/types';

interface PublicFeedProps {
  limit?: number;
}

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  avatarColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClassMap: Record<Required<AvatarProps>['size'], string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

function Avatar({ name, avatarUrl, avatarColor, size = 'md' }: AvatarProps) {
  const displayName = name?.trim() || 'User';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${displayName}'s avatar`}
        className={`${sizeClassMap[size]} rounded-full object-cover border`}
      />
    );
  }

  return (
    <div
      className={`${sizeClassMap[size]} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ backgroundColor: avatarColor || '#3B82F6' }}
    >
      {initials || 'U'}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4" />
          <div className="h-3 bg-gray-300 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

function formatRelative(dateString: string) {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const now = new Date();
  const diffInHours = (now.getTime() - parsed.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`;
  }

  return parsed.toLocaleDateString();
}

export function PublicFeed({ limit = 20 }: PublicFeedProps) {
  const [posts, setPosts] = useState<FamilyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublicPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const publicPosts = await api.getPublicFeed(limit, 0);
      setPosts(publicPosts);
    } catch (err) {
      console.error('Failed to load public feed:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadPublicPosts();
  }, [loadPublicPosts]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadPublicPosts}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No public posts yet</h3>
        <p className="text-gray-600">Be the first to share something with the Kinjar community.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/families/${post.familySlug}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: post.familyThemeColor || "#2563eb" }}
                >
                  {post.familyName?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.familyName}</h3>
                  <p className="text-sm text-gray-500">@{post.familySlug}</p>
                </div>
              </Link>
              <span className="text-sm text-gray-500 whitespace-nowrap">{formatRelative(post.createdAt)}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={post.authorName}
                avatarUrl={post.authorAvatarUrl}
                avatarColor={post.authorAvatarColor}
              />
              <div>
                <p className="font-medium text-gray-900">{post.authorName}</p>
                <p className="text-sm text-gray-500">{formatRelative(post.createdAt)}</p>
              </div>
            </div>

            {post.title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{post.title}</h2>
            )}

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {post.media && (
              <div className="mt-3">
                {post.media.type === 'image' ? (
                  <img
                    src={post.media.url}
                    alt={post.media.alt || 'Post image'}
                    className="rounded-lg w-full object-cover"
                  />
                ) : (
                  <video
                    src={`${post.media.url}#t=0.5`}
                    controls
                    preload="metadata"
                    className="rounded-lg w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            {post.comments && post.comments.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}
                </h4>
                <div className="space-y-3">
                  {post.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar
                        name={comment.authorName}
                        avatarUrl={comment.authorAvatarUrl}
                        avatarColor={comment.authorAvatarColor}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{comment.authorName}</span>
                            <span className="text-xs text-gray-500">{formatRelative(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {post.comments.length > 3 && (
                    <Link
                      href={`/families/${post.familySlug}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {post.comments.length} comments →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm">{post.reactions || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c04.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </div>
              </div>
              <Link
                href={`/families/${post.familySlug}`}
                className="inline-flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Visit Family →
              </Link>
            </div>
          </div>
        </article>
      ))}

      <div className="text-center pt-6">
        <button
          onClick={loadPublicPosts}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Refresh Feed
        </button>
      </div>
    </div>
  );
}

