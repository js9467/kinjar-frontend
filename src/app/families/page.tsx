'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UploadComponent from '../../components/UploadComponent';
import { useAuth } from '../../lib/auth';
import { api, Post } from '../../lib/api';

export default function FamilyHubPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get the first family/tenant the user belongs to
  const primaryTenant = user?.tenants?.[0];
  const familySlug = primaryTenant?.slug;

  const loadPosts = useCallback(async () => {
    if (!familySlug) {
      setPosts([]);
      return;
    }

    try {
      setFetchingPosts(true);
      setFetchError(null);
      // Note: This might need to be updated to use family slug instead of ID
      // For now, we'll use a mock implementation or update the API call
      const familyPosts = await api.getFamilyPosts(familySlug);
      setPosts(familyPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to load posts');
    } finally {
      setFetchingPosts(false);
    }
  }, [familySlug]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    void loadPosts();
  }, [loading, user, router, loadPosts]);

  const handleUploadSuccess = useCallback(
    (post: Post) => {
      setUploadError(null);
      setPosts(prev => [post, ...prev]);
    },
    []
  );

  const handleUploadError = useCallback((message: string) => {
    setUploadError(message);
  }, []);

  const hasFamily = !!familySlug;

  const title = useMemo(() => {
    if (!user) {
      return '';
    }
    if (primaryTenant?.name) {
      return `${primaryTenant.name} Hub`;
    }
    return 'Family Hub';
  }, [user, primaryTenant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">
            Share updates, photos, and videos with your family in one private place.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setUploadError(null);
                void loadPosts();
              }}
              disabled={fetchingPosts || !hasFamily}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh feed
            </button>
            {fetchingPosts && <span className="text-sm text-gray-500">Updating...</span>}
          </div>
        </div>

        {uploadError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {uploadError}
          </div>
        )}

        {fetchError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {fetchError}
          </div>
        )}

        {typeof familyId === 'number' ? (
          <div className="space-y-8">
            <UploadComponent
              familyId={familyId}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
              </div>

              {fetchingPosts && posts.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="loading-spinner" aria-hidden="true" />
                    <span>Loading family posts...</span>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                  <p className="text-lg font-medium text-gray-700">No posts yet</p>
                  <p className="mt-2 text-sm text-gray-500">Upload a photo or video to start your family feed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <article key={post.id} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <header className="flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-gray-900">{post.username}</span>
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleString()}
                        </time>
                      </header>
                      <div className="space-y-4">
                        {post.content && (
                          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                        )}
                        {post.media_url && (
                          post.media_type === 'video' ? (
                            <video
                              controls
                              className="w-full overflow-hidden rounded-lg border border-gray-200"
                            >
                              <source src={post.media_url} />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <Image
                              src={post.media_url}
                              alt={post.content || 'Family post media'}
                              width={1200}
                              height={800}
                              className="w-full rounded-lg border border-gray-200 object-cover"
                              sizes="(min-width: 1024px) 900px, (min-width: 768px) 700px, 100vw"
                            />
                          )
                        )}
                      </div>
                      <footer className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{post.reaction_count} reactions</span>
                        <span>{post.comment_count} comments</span>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No family assigned yet</h2>
            <p className="mt-2 text-gray-600">
              Ask a family admin to add you to a family to start sharing memories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
