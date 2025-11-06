'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FamilyPost, FamilyProfile } from '@/lib/types';
import { api, getSubdomainInfo } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAppState } from '@/lib/app-state';
import { PostCreator } from '@/components/family/PostCreator';
import { CommentSection, PostReactions } from '@/components/family/CommentSection';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';
import { EnhancedFamilyAdmin } from '@/components/admin/EnhancedFamilyAdmin';
import { FamilyConnectionsManager } from '@/components/FamilyConnectionsManager';
import { FamilyAppHeader } from '@/components/layout/FamilyAppHeader';
import { FamilyHeaderActions } from '@/components/layout/FamilyHeaderActions';
import { ChildProvider, useOptionalChildContext } from '@/lib/child-context';
import { ThemeProvider } from '@/lib/theme-context';
import { getMemberAgeDisplay } from '@/lib/age-utils';
import Image from 'next/image';
import Link from 'next/link';

interface FamilyDashboardProps {
  familySlug?: string;
}

export function FamilyDashboard({ familySlug }: FamilyDashboardProps) {
    console.log('[FamilyDashboard] ===== COMPONENT LOADED - VERSION 2.0 =====');
  const { user, isAuthenticated, canManageFamily, isRootAdmin } = useAuth();
  const { families } = useAppState();
  const childContext = useOptionalChildContext();
  const [family, setFamily] = useState<FamilyProfile | null>(null);
  const [posts, setPosts] = useState<FamilyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'family_only' | 'family_and_connections'>('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Family connections modal
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  
  // Expanded connected family state (for inline display)
  const [expandedFamilySlug, setExpandedFamilySlug] = useState<string | null>(null);
  const [expandedFamilyData, setExpandedFamilyData] = useState<FamilyProfile | null>(null);
  const [loadingExpandedFamily, setLoadingExpandedFamily] = useState(false);
  
  // Add a backup for posts to prevent data loss
  const [postsBackup, setPostsBackup] = useState<FamilyPost[]>([]);
  
  // Add localStorage persistence for posts (initialize after effectiveFamilySlug is available)
  const [persistedPosts, setPersistedPosts] = useState<FamilyPost[]>([]);
  
  // Edit functionality
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin interface state
  const [showAdminInterface, setShowAdminInterface] = useState(false);

  // Determine family context - memoize to prevent infinite loops
  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);
  const effectiveFamilySlug = useMemo(() => familySlug || subdomainInfo.familySlug, [familySlug, subdomainInfo.familySlug]);

  const loadFamilyData = useCallback(async () => {
    if (!effectiveFamilySlug) {
      setError('No family context found');
      setLoading(false);
      return;
    }

    console.log('[FamilyDashboard] Loading family data for:', effectiveFamilySlug);
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has access to this family
      if (user && user.memberships && !isRootAdmin) {
        const hasAccess = user.memberships.some(membership => membership.familySlug === effectiveFamilySlug);
        if (!hasAccess) {
          // User is logged in but not a member of this family and not a root admin
          setError(`Access denied: You are not a member of the ${effectiveFamilySlug} family.`);
          setLoading(false);
          return;
        }
      }
      
      // Try to load from API first
      try {
        const familyData = await api.getFamilyBySlug(effectiveFamilySlug);
        
        console.log('[FamilyDashboard] Raw family data from API:', familyData);
        console.log('[FamilyDashboard] Family members from API:', familyData.members);
        console.log('[FamilyDashboard] Connected families from API:', familyData.connectedFamilies);
        
        // Ensure all arrays are initialized to prevent undefined errors
        const normalizedFamily = {
          ...familyData,
          posts: familyData.posts || [],
          members: familyData.members || [],
          connections: familyData.connections || [],
          connectedFamilies: familyData.connectedFamilies || [],
          admins: familyData.admins || [],
          highlights: familyData.highlights || [],
          pendingMembers: familyData.pendingMembers || []
        };
        
        console.log('[FamilyDashboard] Normalized family members:', normalizedFamily.members.length, normalizedFamily.members);
        
        setFamily(normalizedFamily);
        setError(null);
        
        console.log('[FamilyDashboard] Family data loaded:', normalizedFamily.name, 'Posts in family data:', normalizedFamily.posts?.length || 0);
        
        // Always load posts from connected families feed (includes own family posts + connected family posts)
        console.log('[FamilyDashboard] Loading posts including connected families...');
        try {
          // Use getConnectedFamiliesFeed to get posts from own family + connected families
          const postsData = await api.getConnectedFamiliesFeed(effectiveFamilySlug);
          console.log('[FamilyDashboard] Loaded posts (including connections):', postsData.length);
          const normalizedPosts = postsData.map(post => ({
            ...post,
            comments: post.comments || [],
            tags: post.tags || []
          }));
          const sortedPosts = normalizedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPosts(sortedPosts);
          setPostsBackup(sortedPosts); // Backup the posts
            
          // Persist to localStorage
          if (typeof window !== 'undefined' && effectiveFamilySlug) {
            try {
              localStorage.setItem(`familyPosts_${effectiveFamilySlug}`, JSON.stringify(sortedPosts));
              console.log('[FamilyDashboard] Posts persisted to localStorage:', sortedPosts.length);
            } catch (error) {
              console.error('[FamilyDashboard] Failed to persist posts:', error);
            }
          }
        } catch (postsError) {
          console.log('[FamilyDashboard] Failed to load connected feed, checking localStorage...');
          
          // Try to recover from localStorage
          if (persistedPosts.length > 0) {
            console.log('[FamilyDashboard] Recovering posts from localStorage:', persistedPosts.length);
            setPosts(persistedPosts);
            setPostsBackup(persistedPosts);
          } else {
            console.log('[FamilyDashboard] No posts in localStorage either, using empty array');
            setPosts([]);
          }
        }
      } catch (apiError) {
        console.error('Failed to load family data:', apiError);
        const errorMessage = `Failed to load family data: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  }, [effectiveFamilySlug]);

  useEffect(() => {
    console.log('[FamilyDashboard] useEffect triggered, effectiveFamilySlug:', effectiveFamilySlug);
    loadFamilyData();
  }, [loadFamilyData]);

  // Initialize localStorage posts when familySlug is available
  useEffect(() => {
    if (typeof window !== 'undefined' && effectiveFamilySlug) {
      try {
        const saved = localStorage.getItem(`familyPosts_${effectiveFamilySlug}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setPersistedPosts(parsed);
          console.log('[FamilyDashboard] Loaded persisted posts from localStorage:', parsed.length);
        }
      } catch (error) {
        console.error('[FamilyDashboard] Failed to load persisted posts:', error);
      }
    }
  }, [effectiveFamilySlug]);

  // Safety check: restore posts from backup if they get cleared unexpectedly
  useEffect(() => {
    if (posts.length === 0 && !loading) {
      // Try backup first
      if (postsBackup.length > 0) {
        console.log('[FamilyDashboard] Posts were cleared, restoring from backup:', postsBackup.length);
        setPosts(postsBackup);
      } 
      // Try localStorage if no backup
      else if (persistedPosts.length > 0) {
        console.log('[FamilyDashboard] No backup available, restoring from localStorage:', persistedPosts.length);
        setPosts(persistedPosts);
        setPostsBackup(persistedPosts);
      }
    }
  }, [posts.length, postsBackup.length, persistedPosts.length, loading]);

  const handlePostCreated = (newPost: FamilyPost) => {
    // Just update React state - the post was already saved to database via API
    setPosts(prev => [newPost, ...prev]);
  };

  const handleCommentAdded = (postId: string, comment: any) => {
    console.log(`[FamilyDashboard] Adding comment to post ${postId}:`, comment);
    // Just update React state - the comment was already saved to database via API
    setPosts(prev => {
      const updated = prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...(post.comments || []), comment] }
          : post
      );
      console.log(`[FamilyDashboard] Updated posts with new comment:`, updated.find(p => p.id === postId)?.comments);
      return updated;
    });
  };

  const handleReaction = (postId: string, reaction: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, reactions: post.reactions + 1 }
        : post
    ));
  };

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    // Store the current posts list for potential rollback
    const originalPostsList = [...posts];

    try {
      setDeletingPostId(postToDelete);
      
      // Optimistic update - remove post immediately
      setPosts(prev => prev.filter(post => post.id !== postToDelete));
      
      // Try to delete from backend
      await api.deletePost(postToDelete);
      
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      
      // Rollback - restore the original posts if deletion failed
      const deletedPost = originalPostsList.find(post => post.id === postToDelete);
      if (deletedPost) {
        setPosts(prev => [...prev, deletedPost].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleEditPost = (post: FamilyPost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const saveEditPost = async () => {
    if (!editingPostId || !editContent.trim()) return;

    try {
      setSavingEdit(true);
      const tenantSlug = effectiveFamilySlug || family?.slug || family?.id;
      
      console.log('[FamilyDashboard] Saving post edit:', {
        postId: editingPostId,
        content: editContent.trim().substring(0, 50) + '...',
        tenantSlug: tenantSlug
      });
      
      const updatedPost = await api.editPost(editingPostId, editContent.trim(), tenantSlug);

      // Update the posts list with the edited post, preserving the original authorName
      setPosts(prev => prev.map(post =>
        post.id === editingPostId ? { ...updatedPost, authorName: post.authorName } : post
      ));
      
      setEditingPostId(null);
      setEditContent('');
      
      console.log('[FamilyDashboard] Post edit successful');
    } catch (err) {
      console.error('[FamilyDashboard] Failed to edit post:', err);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to edit post';
      
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to edit this post. Please log in again.';
        } else if (err.message.includes('403') || err.message.includes('forbidden')) {
          errorMessage = 'You do not have permission to edit this post.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Post not found. It may have been deleted by another user.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. The edit may have been saved despite this error. Please refresh the page to check.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle toggling connected family expansion to show members and bio
  const handleConnectedFamilyClick = async (familySlug: string) => {
    console.log('[FamilyDashboard] Clicked connected family:', familySlug);
    
    // If already expanded, collapse it
    if (expandedFamilySlug === familySlug) {
      setExpandedFamilySlug(null);
      setExpandedFamilyData(null);
      return;
    }
    
    // Load and expand the family
    setExpandedFamilySlug(familySlug);
    setLoadingExpandedFamily(true);
    
    try {
      const familyData = await api.getFamilyBySlug(familySlug);
      console.log('[FamilyDashboard] Loaded connected family data:', familyData);
      console.log('[FamilyDashboard] Connected family members:', familyData.members?.length, familyData.members);
      setExpandedFamilyData(familyData);
    } catch (err) {
      console.error('Failed to load family data:', err);
      setError('Failed to load family information');
      setExpandedFamilySlug(null);
    } finally {
      setLoadingExpandedFamily(false);
    }
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.visibility === filter;
  });

  // Show loading
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

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginEmail || !loginPassword) return;
      
      try {
        setLoginLoading(true);
        setLoginError('');
        
        const { user: loggedInUser } = await api.login(loginEmail, loginPassword);
        console.log('Login successful:', loggedInUser);
        
        // Reload the page to refresh the authentication state
        window.location.reload();
      } catch (err) {
        console.error('Login failed:', err);
        setLoginError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to {effectiveFamilySlug ? `${effectiveFamilySlug.charAt(0).toUpperCase() + effectiveFamilySlug.slice(1)} Family` : 'Kinjar'}
            </h1>
            <p className="text-gray-600">
              Sign in to access your family space and share memories together.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !loginEmail || !loginPassword}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Don't have an account? Create one
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
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
    <ChildProvider familyId={family.id} familySlug={effectiveFamilySlug}>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50">
        {/* Family App Header with Child Selector */}
        <FamilyAppHeader
          title={family.name}
          description={family.description}
          user={user!}
          stats={{
            members: family.members.length,
            posts: posts.length,
            connections: (family.connectedFamilies || []).length,
          }}
          onConnectionsClick={() => setShowConnectionsModal(true)}
          onMembersClick={() => {
            // Scroll to members section or handle members view
            const membersSection = document.getElementById('family-members');
            if (membersSection) {
              membersSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onChangePasswordClick={() => setShowChangePasswordModal(true)}
          onLogout={async () => {
            await api.logout();
            window.location.href = '/auth/login';
          }}
          actions={
            <FamilyHeaderActions
              canManageFamily={canManageFamily(family.id)}
              familyId={family.id}
              showAdminInterface={showAdminInterface}
              setShowAdminInterface={setShowAdminInterface}
            />
          }
        />

        {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Enhanced Family Admin Interface */}
        {showAdminInterface && loading && (
          <div className="mb-8">
            <div className="text-center py-8">
              <span className="loader inline-block mr-2"></span> Loading family data...
            </div>
          </div>
        )}
        {showAdminInterface && family && family.id ? (
          (() => { console.log('[FamilyDashboard] Loaded family:', family); return (
            <div className="mb-8">
              <EnhancedFamilyAdmin 
                familyId={family.id} 
                familySlug={effectiveFamilySlug || family.slug} 
              />
            </div>
          ); })()
        ) : showAdminInterface && family && !family.id && !loading ? (
          <div className="mb-8">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg">
              Error: Family ID is missing. Cannot manage members until family is fully loaded.<br />
              <pre className="text-xs mt-2">{JSON.stringify(family, null, 2)}</pre>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            <PostCreator
              familyId={effectiveFamilySlug || 'unknown'}
              familySlug={effectiveFamilySlug}
              initialMembers={family?.members || []}
              onPostCreated={handlePostCreated}
              onError={setError}
            />

            {/* Posts Filter */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
              <span className="text-sm text-gray-600 font-medium">Show:</span>
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'family_only', label: 'Family Only' },
                { key: 'family_and_connections', label: 'Shared' }
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
                filteredPosts.map((post) => {
                  // Permission check logic:
                  // When acting as a child, we need to match the posted_as_id
                  // Otherwise, check if the user is the actual author
                  const ownsPost = (() => {
                    if (childContext?.selectedChild) {
                      // When acting as a child, check if this post was posted as this specific child
                      return post.postedAsId === childContext.selectedChild.userId;
                    } else {
                      // When not acting as a child, check if user is the actual author
                      // OR if the post was posted as one of the user's child profiles (but user is not currently acting as child)
                      return post.authorId === user?.id;
                    }
                  })();
                  
                  // Get user's role in their own family
                  const userRole = user?.memberships?.find(m => m.familySlug === effectiveFamilySlug)?.role;
                  
                  // Check if the post author is a child in the user's family
                  const postAuthorInUsersFamily = family.members.find(m => m.userId === post.authorId);
                  const postAuthorIsChild = postAuthorInUsersFamily?.role?.startsWith('CHILD');
                  
                  // Check if the post was posted as a child in the user's family
                  const postedAsInUsersFamily = post.postedAsId ? family.members.find(m => m.userId === post.postedAsId) : null;
                  const postedAsIsChild = postedAsInUsersFamily?.role?.startsWith('CHILD');
                  
                  // Edit permission logic:
                  // - Users can edit their own posts (matching posted_as context)
                  // - Admins/Adults can edit posts by children in their family (even on connected family posts)
                  // - Children can ONLY edit their own posts (must match posted_as_id)
                  const canEditPost = (() => {
                    if (!user || !userRole) return false;
                    
                    // Children can ONLY edit their own posts
                    if (userRole.startsWith('CHILD')) {
                      return ownsPost;
                    }
                    
                    // User can edit their own posts
                    if (ownsPost) return true;
                    
                    // Admins can edit posts by children in their family
                    // Check both: if posted as a child OR if author is a child
                    if (userRole === 'ADMIN') {
                      if (postedAsInUsersFamily && postedAsIsChild) return true;
                      if (postAuthorInUsersFamily && postAuthorIsChild) return true;
                    }
                    
                    // Adults can edit posts by children in their family
                    if (userRole === 'ADULT') {
                      if (postedAsInUsersFamily && postedAsIsChild) return true;
                      if (postAuthorInUsersFamily && postAuthorIsChild) return true;
                    }
                    
                    return false;
                  })();
                  
                  // Delete permission logic:
                  // - Users can delete their own posts
                  // - Admins can delete any post in their family, or children's posts on connected families
                  // - Adults can delete posts by children in their family (even on connected family posts)
                  // - Children can ONLY delete their own posts
                  const canDeletePost = (() => {
                    if (!user || !userRole) return false;
                    
                    // Children can ONLY delete their own posts
                    if (userRole.startsWith('CHILD')) {
                      return ownsPost;
                    }
                    
                    // User can delete their own posts
                    if (ownsPost) return true;
                    
                    // Admins can delete any post in their own family
                    if (userRole === 'ADMIN' && post.familySlug === effectiveFamilySlug) {
                      return true;
                    }
                    
                    // Admins can delete posts by children in their family (even on connected family posts)
                    // Check both: if posted as a child OR if author is a child
                    if (userRole === 'ADMIN') {
                      if (postedAsInUsersFamily && postedAsIsChild) return true;
                      if (postAuthorInUsersFamily && postAuthorIsChild) return true;
                    }
                    
                    // Adults can delete posts by children in their family (even on connected family posts)
                    if (userRole === 'ADULT') {
                      if (postedAsInUsersFamily && postedAsIsChild) return true;
                      if (postAuthorInUsersFamily && postAuthorIsChild) return true;
                    }
                    
                    return false;
                  })();

                  return (
                    <article key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      {/* Post Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {post.authorAvatarUrl ? (
                              <img
                                src={post.authorAvatarUrl}
                                alt={`${post.authorName || 'User'}'s avatar`}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                style={{ backgroundColor: post.authorAvatarColor }}
                              >
                                {(post.authorName || 'User')
                                  .split(' ')
                                  .map(part => part[0])
                                  .join('')
                                  .slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{post.authorName || 'User'}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  post.visibility === 'family_and_connections'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {post.visibility === 'family_and_connections' ? 'Shared' : 'Family Only'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {(canEditPost || canDeletePost) && editingPostId !== post.id ? (
                            <div className="flex gap-2">
                              {canEditPost && (
                                <button
                                  onClick={() => handleEditPost(post)}
                                  className="text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                  Edit
                                </button>
                              )}
                              {canDeletePost && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={deletingPostId === post.id}
                                  className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingPostId === post.id ? 'Deleting…' : 'Delete'}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-6">
                        {editingPostId === post.id ? (
                          <div className="mb-4 space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-3 text-sm resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              rows={4}
                              placeholder="What's on your mind?"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditPost}
                                disabled={savingEdit || !editContent.trim()}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingEdit ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEditPost}
                                disabled={savingEdit}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {post.content && (
                              <p className="text-gray-900 whitespace-pre-wrap mb-4">{post.content}</p>
                            )}
                          </>
                        )}
                      
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
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
                                preload="metadata"
                              >
                                <source src={`${post.media.url}#t=0.5`} type="video/mp4" />
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
                          familyMembers={family.members.map(m => ({
                            userId: m.userId || m.id,
                            name: m.name,
                            role: m.role
                          }))}
                        />
                      </div>
                    </article>
                  );
                })
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
                  <span className="text-sm text-gray-600">Created:</span>
                  <p className="text-sm text-gray-900">{new Date(family.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Posts:</span>
                  <p className="text-sm text-gray-900">{posts.length}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Connections:</span>
                  <p className="text-sm text-gray-900">{family.connectedFamilies?.length || 0} families</p>
                </div>
              </div>
            </div>

            {/* Family Members */}
            <div id="family-members" className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h2>
              <div className="space-y-3">
                {family.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {(member.name || 'User')
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{getMemberAgeDisplay(member.birthdate, member.role)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Families */}
            {family.connectedFamilies && family.connectedFamilies.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Families</h2>
                <div className="space-y-3">
                  {family.connectedFamilies.map((connection) => (
                    <div key={connection.id} className="space-y-2">
                      {/* Family Header - Clickable */}
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        onClick={() => handleConnectedFamilyClick(connection.familySlug)}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {connection.familyName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{connection.familyName}</p>
                          <p className="text-xs text-gray-500">
                            Connected {new Date(connection.connectedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-gray-400 transition-transform ${expandedFamilySlug === connection.familySlug ? 'rotate-90' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Content - Family Bio and Members */}
                      {expandedFamilySlug === connection.familySlug && (
                        <div className="ml-11 pl-4 border-l-2 border-gray-200 space-y-4 pb-3">
                          {loadingExpandedFamily ? (
                            <div className="py-4">
                              <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ) : expandedFamilyData ? (
                            <>
                              {/* Family Bio */}
                              {expandedFamilyData.description && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-semibold text-gray-700 mb-1">About</h4>
                                  <p className="text-sm text-gray-600">{expandedFamilyData.description}</p>
                                </div>
                              )}

                              {/* Family Members */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                  Members ({expandedFamilyData.members.length})
                                </h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {expandedFamilyData.members.map((member) => (
                                    <Link
                                      key={member.id}
                                      href={`/profile/${member.id}`}
                                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                                    >
                                      {member.avatarUrl ? (
                                        <img 
                                          src={member.avatarUrl} 
                                          alt={member.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                          style={{ backgroundColor: member.avatarColor }}
                                        >
                                          {(member.name || 'U')[0]}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                          {member.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {getMemberAgeDisplay(member.birthdate, member.role)}
                                        </p>
                                      </div>
                                      <div className="text-gray-400 group-hover:text-blue-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </div>
                                    </Link>
                                  ))}
                                  {expandedFamilyData.members.length === 0 && (
                                    <p className="text-sm text-gray-500 py-2">No members found</p>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      )}
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

      {/* Access Denied Modal */}
      {error && error.includes('Access denied') && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-600 mb-6">
                You are not a member of the {effectiveFamilySlug} family. You can only view families you belong to or that are connected to your family.
              </p>
              <div className="space-y-3">
                {user.memberships && user.memberships.length > 0 && (
                  <Link
                    href="/families/select"
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to My Families
                  </Link>
                )}
                <Link
                  href="/"
                  className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Return to Home
                </Link>
                <button
                  onClick={() => setError(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deletingPostId === postToDelete}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Family Connections Modal */}
      {showConnectionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowConnectionsModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Family Connections</h2>
                <button
                  onClick={() => setShowConnectionsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FamilyConnectionsManager 
                tenantSlug={effectiveFamilySlug || family?.slug || ''}
              />
            </div>
          </div>
        </div>
      )}
      </div>
      </ThemeProvider>
    </ChildProvider>
  );
}
