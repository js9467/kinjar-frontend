'use client';

import React, { useState, useEffect } from 'react';
import { FamilyPost, FamilyProfile } from '@/lib/types';
import { api, getSubdomainInfo } from '@/lib/api';
import { PostCreator } from '@/components/family/PostCreator';
import { CommentSection, PostReactions } from '@/components/family/CommentSection';
import Image from 'next/image';

interface FamilyDashboardProps {
  familySlug?: string;
}

export function FamilyDashboard({ familySlug }: FamilyDashboardProps) {
  const [family, setFamily] = useState<FamilyProfile | null>(null);
  const [posts, setPosts] = useState<FamilyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'family' | 'connections'>('all');

  // Determine family context
  const subdomainInfo = getSubdomainInfo();
  const effectiveFamilySlug = familySlug || subdomainInfo.familySlug;

  useEffect(() => {
    loadFamilyData();
  }, [effectiveFamilySlug]);

  const loadFamilyData = async () => {
    if (!effectiveFamilySlug) {
      setError('No family context found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const familyData = await api.getFamilyBySlug(effectiveFamilySlug);
        setFamily(familyData);
        setPosts(familyData.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (apiError) {
        console.log('API not available, using mock data for development');
        
        // Use mock data for development/demo
        const mockFamily = {
          id: 'mock-family-1',
          slug: effectiveFamilySlug,
          name: effectiveFamilySlug.charAt(0).toUpperCase() + effectiveFamilySlug.slice(1),
          description: `Welcome to the ${effectiveFamilySlug.charAt(0).toUpperCase() + effectiveFamilySlug.slice(1)} family space`,
          missionStatement: 'Connecting our family through shared memories and moments',
          bannerImage: '',
          themeColor: '#2563EB',
          heroImage: '',
          admins: ['admin-1'],
          members: [
            {
              id: 'member-1',
              name: 'Family Admin',
              email: `admin@${effectiveFamilySlug}.family`,
              role: 'ADMIN' as const,
              avatarColor: '#2563EB',
              joinedAt: new Date().toISOString()
            },
            {
              id: 'member-2', 
              name: 'Family Member',
              email: `member@${effectiveFamilySlug}.family`,
              role: 'ADULT' as const,
              avatarColor: '#7C3AED',
              joinedAt: new Date().toISOString()
            }
          ],
          posts: [
            {
              id: 'post-1',
              familyId: 'mock-family-1',
              authorId: 'member-1',
              authorName: 'Family Admin',
              authorAvatarColor: '#2563EB',
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              content: 'Welcome to our family space! This is where we share our memories, photos, and stay connected.',
              visibility: 'family' as const,
              status: 'approved' as const,
              reactions: 5,
              comments: [
                {
                  id: 'comment-1',
                  authorName: 'Family Member',
                  authorAvatarColor: '#7C3AED',
                  content: 'So excited to have our own family space!',
                  createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                }
              ],
              tags: ['welcome', 'family']
            },
            {
              id: 'post-2',
              familyId: 'mock-family-1', 
              authorId: 'member-2',
              authorName: 'Family Member',
              authorAvatarColor: '#7C3AED',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              content: 'Testing out posting! Can\'t wait to share photos and videos here.',
              visibility: 'public' as const,
              status: 'approved' as const,
              reactions: 3,
              comments: [],
              tags: ['test']
            }
          ],
          connections: [],
          connectedFamilies: [],
          storageUsedMb: 12,
          invitesSentThisMonth: 1,
          pendingMembers: [],
          highlights: [],
          isPublic: true,
          subdomain: effectiveFamilySlug,
          createdAt: new Date().toISOString(),
          ownerId: 'admin-1'
        };
        
        setFamily(mockFamily);
        setPosts(mockFamily.posts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: FamilyPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleCommentAdded = (postId: string, comment: any) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
  };

  const handleReaction = (postId: string, reaction: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, reactions: post.reactions + 1 }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.visibility === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadFamilyData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Family not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Family Header */}
      <div 
        className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600"
        style={{ backgroundColor: family.themeColor }}
      >
        {family.heroImage && (
          <Image
            src={family.heroImage}
            alt={`${family.name} hero image`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{family.name}</h1>
            <p className="text-xl text-gray-200">{family.description}</p>
            <div className="mt-4 flex items-center gap-4 text-gray-200">
              <span>{family.members.length} member{family.members.length === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{posts.length} post{posts.length === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{family.connections.length} connection{family.connections.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            <PostCreator
              familyId={family.id}
              onPostCreated={handlePostCreated}
              onError={setError}
            />

            {/* Posts Filter */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
              <span className="text-sm text-gray-600 font-medium">Show:</span>
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'family', label: 'Family Only' },
                { key: 'connections', label: 'Connections' },
                { key: 'public', label: 'Public' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Share your first family moment to get started!</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {/* Post Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: post.authorAvatarColor }}
                          >
                            {post.authorName
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                post.visibility === 'public' 
                                  ? 'bg-green-100 text-green-800'
                                  : post.visibility === 'connections'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {post.visibility === 'public' ? 'Public' 
                                 : post.visibility === 'connections' ? 'Connections'
                                 : 'Family Only'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-6">
                      {post.content && (
                        <p className="text-gray-900 whitespace-pre-wrap mb-4">{post.content}</p>
                      )}
                      
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Media */}
                      {post.media && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          {post.media.type === 'image' ? (
                            <div className="relative w-full h-96">
                              <Image
                                src={post.media.url}
                                alt={post.media.alt || 'Post image'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 66vw"
                              />
                            </div>
                          ) : (
                            <video
                              controls
                              className="w-full max-h-96 rounded-lg"
                              poster={post.media.alt}
                            >
                              <source src={post.media.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Interactions */}
                    <div className="px-6 py-4 border-t border-gray-100">
                      <PostReactions 
                        post={post} 
                        onReaction={handleReaction}
                      />
                    </div>

                    {/* Comments */}
                    <div className="px-6 pb-6">
                      <CommentSection
                        post={post}
                        onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                        onError={setError}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Family Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Info</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Mission:</span>
                  <p className="text-sm text-gray-900">{family.missionStatement || 'No mission statement set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created:</span>
                  <p className="text-sm text-gray-900">{new Date(family.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Storage Used:</span>
                  <p className="text-sm text-gray-900">{family.storageUsedMb} MB</p>
                </div>
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h2>
              <div className="space-y-3">
                {family.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role.replace('_', ' ').toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Families */}
            {family.connectedFamilies.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Families</h2>
                <div className="space-y-3">
                  {family.connectedFamilies.map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {connection.familyName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{connection.familyName}</p>
                        <p className="text-xs text-gray-500">
                          Connected {new Date(connection.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}