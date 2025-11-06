// User Profile Page - Dynamic route for viewing user profiles and their posts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FamilyMemberProfile, FamilyPost } from '@/lib/types';
import { useOptionalTheme } from '@/lib/theme-context';
import { getMemberAgeDisplay } from '@/lib/age-utils';
import { getSubdomainInfo } from '@/lib/api';
import Link from 'next/link';
import { AuthenticatedImage } from '@/components/ui/AuthenticatedImage';
import { CommentSection } from '@/components/family/CommentSection';
import { PostComment } from '@/lib/types';

interface UserProfilePageProps {
  params: { userId: string };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { currentTheme } = useOptionalTheme();
  const [userProfile, setUserProfile] = useState<FamilyMemberProfile | null>(null);
  const [userPosts, setUserPosts] = useState<FamilyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[UserProfilePage] useEffect triggered', { user: !!user, userId: params.userId });
    
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get the current family from the subdomain
        const subdomainInfo = getSubdomainInfo();
        if (!subdomainInfo.familySlug) {
          console.log('[UserProfilePage] No family context found');
          setError('No family context found');
          return;
        }

        // First, try to get the user profile directly from the API
        let member: FamilyMemberProfile | null = null;
        try {
          member = await api.getUserProfile(params.userId);
          console.log('[UserProfilePage] Got user profile directly from API:', member);
        } catch (err) {
          console.log('[UserProfilePage] Could not get user profile directly, checking family members');
          
          // Fall back to searching in family members
          const family = await api.getFamilyBySlug(subdomainInfo.familySlug);
          member = family.members.find(m => m.id === params.userId || m.userId === params.userId) || null;
          
          if (!member) {
            console.log('[UserProfilePage] User not found:', params.userId);
            console.log('[UserProfilePage] Available members:', family.members.map(m => ({ id: m.id, userId: m.userId, name: m.name })));
            setError('User profile not found');
            return;
          }
        }

        console.log('[UserProfilePage] Profile loaded successfully', { memberId: member.id, userId: member.userId });
        setUserProfile(member);
        
        // Load user's posts - use the userId (not member id) for the backend query
        const userIdForPosts = member.userId || member.id;
        setLoadingPosts(true);
        try {
          const posts = await api.getUserPosts(userIdForPosts, subdomainInfo.familySlug);
          setUserPosts(posts);
          console.log(`[UserProfilePage] Loaded ${posts.length} posts for user`);
        } catch (err) {
          console.error('[UserProfilePage] Error loading user posts:', err);
          // Don't fail the whole page if posts fail to load
          setUserPosts([]);
        } finally {
          setLoadingPosts(false);
        }
      } catch (err) {
        console.error('[UserProfilePage] Error loading user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, router, params.userId]);

  const handlePostUpdate = (updatedPost: FamilyPost) => {
    setUserPosts(prevPosts => 
      prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
    );
  };

  const handlePostDelete = (postId: string) => {
    setUserPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

  const handleCommentAdded = (postId: string, comment: PostComment) => {
    setUserPosts(prevPosts => 
      prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), comment]
          };
        }
        return p;
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The requested profile could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ 
        background: `linear-gradient(135deg, ${currentTheme.color}10 0%, ${currentTheme.color}05 100%)` 
      }}
    >
      {/* Header */}
      <div 
        className="bg-gradient-to-r text-white py-8"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.color} 0%, ${currentTheme.color}dd 100%)` 
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-white hover:opacity-80 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-4xl font-bold" style={{ color: 'white' }}>
                {userProfile.name}'s Profile
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: userProfile.avatarColor }}
                >
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium capitalize">
                  {userProfile.role.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              
              {userProfile.birthdate && (
                <p className="text-gray-600 mb-3">
                  {getMemberAgeDisplay(userProfile.birthdate, userProfile.role)}
                </p>
              )}

              {userProfile.bio && (
                <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
              )}

              {!userProfile.bio && (
                <p className="text-gray-400 italic">No bio available</p>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Posts by {userProfile.name}
          </h2>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <p className="text-gray-600">No posts yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {userPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${post.postedAsId || post.authorId}`}
                        className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition-colors inline-block cursor-pointer"
                      >
                        {post.authorName || 'User'}
                      </Link>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{post.content}</p>
                    </div>
                    <Link href={`/profile/${post.postedAsId || post.authorId}`} className="flex-shrink-0">
                      {post.authorAvatarUrl ? (
                        <img
                          src={post.authorAvatarUrl}
                          alt={`${post.authorName}'s avatar`}
                          className="h-10 w-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: post.authorAvatarColor }}
                        >
                          {(post.authorName || 'User')
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </span>
                      )}
                    </Link>
                  </div>
                  {post.media ? (
                    <div className="mt-4 overflow-hidden rounded-2xl">
                      {post.media.type === 'image' ? (
                        <div className="relative h-64 w-full">
                          <AuthenticatedImage
                            src={post.media.url}
                            alt={post.media.alt ?? 'Family moment'}
                            fill
                            className="object-cover"
                            sizes="(min-width: 768px) 60vw, 100vw"
                          />
                        </div>
                      ) : (
                        <video
                          controls
                          className="w-full rounded-2xl"
                          preload="metadata"
                        >
                          <source src={`${post.media.url}#t=0.5`} type="video/mp4" />
                          <source src={`${post.media.url}#t=0.5`} type="video/quicktime" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <button 
                      className="flex items-center gap-1 px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
                    >
                      👍 {post.reactions}
                    </button>
                    {post.tags && post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Comments */}
                  <div className="mt-4">
                    <CommentSection 
                      post={post} 
                      onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                      onError={(error) => console.error('Comment error:', error)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
