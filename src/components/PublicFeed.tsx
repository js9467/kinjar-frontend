'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FamilyPost } from '@/lib/types';
import Link from 'next/link';

export function PublicFeed() {
  const [posts, setPosts] = useState<FamilyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicPosts();
  }, []);

  const loadPublicPosts = async () => {
    try {
      setLoading(true);
      const publicPosts = await api.getPublicFeed(10, 0); // Get 10 most recent posts
      setPosts(publicPosts);
    } catch (error) {
      console.error('Failed to load public feed:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
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
        <p className="text-gray-600">No public posts yet. Be the first to share!</p>
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
          {/* Family Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/families/${post.familySlug}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: post.familyThemeColor || '#2563eb' }}
                >
                  {post.familyName?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.familyName}</h3>
                  <p className="text-sm text-gray-500">@{post.familySlug}</p>
                </div>
              </Link>
              <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: post.authorAvatarColor }}
              >
                {post.authorName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.authorName}</p>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {/* Post Title */}
            {post.title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{post.title}</h2>
            )}

            {/* Post Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* Media */}
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
                    src={post.media.url}
                    controls
                    className="rounded-lg w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm">{post.reactions || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c04.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">{post.comments?.length || 0}</span>
                </button>
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
    </div>
  );
}