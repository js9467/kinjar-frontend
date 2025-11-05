'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FamilyPost, PostComment } from '@/lib/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CommentSection, PostReactions } from '@/components/family/CommentSection';

interface FamilyFeedProps {
  familyIds: string[];
  highlightFamilyId?: string;
  title?: string;
  onRefresh?: () => void;
}

export function FamilyFeed({ familyIds, highlightFamilyId, title = 'Family stories', onRefresh }: FamilyFeedProps) {
  const { families } = useAppState();
  const { user, canManageFamily } = useAuth();
  const [filter, setFilter] = useState<'all' | 'family_only' | 'family_and_connections'>('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [deletedPosts, setDeletedPosts] = useState<Set<string>>(new Set());
  const [localPosts, setLocalPosts] = useState<{ [postId: string]: FamilyPost }>({});
  
  // Edit functionality
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const posts = useMemo(() => {
    const relevantFamilies = families.filter((family) => familyIds.includes(family.id));
    return relevantFamilies
      .flatMap((family) =>
        (family.posts || [])
          .filter((post) => post.status === 'approved')
          .filter((post) => !deletedPosts.has(post.id)) // Filter out deleted posts
          .map((post) => ({ 
            post: localPosts[post.id] || post, // Use local version if available
            family 
          }))
      )
      .sort((a, b) => (a.post.createdAt < b.post.createdAt ? 1 : -1));
  }, [families, familyIds, deletedPosts, localPosts]);

  const filteredPosts = useMemo(() => {
    if (filter === 'all') {
      return posts;
    }
    if (filter === 'family_and_connections') {
      return posts.filter((item) => item.post.visibility === 'family_and_connections');
    }
    return posts.filter((item) => item.post.visibility === 'family_only');
  }, [filter, posts]);

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      setDeletingPostId(postToDelete);
      
      // Optimistic update - hide post immediately
      setDeletedPosts(prev => {
        const newSet = new Set(prev);
        newSet.add(postToDelete);
        return newSet;
      });
      
      // Try to delete from backend
      await api.deletePost(postToDelete);
      
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      
      // Rollback - show the post again if deletion failed
      setDeletedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postToDelete);
        return newSet;
      });
      
      alert(err instanceof Error ? err.message : 'Failed to delete post');
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
      const editingEntry = posts.find(({ post }) => post.id === editingPostId);
      const tenantSlug = editingEntry?.family.slug || editingEntry?.family.id || familyIds[0];
      await api.editPost(editingPostId, editContent.trim(), tenantSlug);

      // Refresh the posts to show updated content
      onRefresh?.();
      
      setEditingPostId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit post:', err);
      alert(err instanceof Error ? err.message : 'Failed to edit post');
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleCommentAdded = (postId: string, comment: PostComment) => {
    console.log('[FamilyFeed] Adding comment to post:', postId, comment);
    
    setLocalPosts(prev => {
      const originalPost = posts.find(({ post }) => post.id === postId)?.post;
      if (!originalPost) {
        console.warn('[FamilyFeed] Post not found for comment:', postId);
        return prev;
      }
      
      const updatedPost = {
        ...originalPost,
        comments: [...originalPost.comments, comment]
      };
      
      console.log('[FamilyFeed] Updated post with new comment:', updatedPost);
      
      return {
        ...prev,
        [postId]: updatedPost
      };
    });
  };

  const handleReaction = async (postId: string, reaction: string) => {
    try {
      // Optimistic update
      setLocalPosts(prev => {
        const originalPost = posts.find(({ post }) => post.id === postId)?.post;
        if (!originalPost) return prev;
        
        return {
          ...prev,
          [postId]: {
            ...originalPost,
            reactions: originalPost.reactions + 1
          }
        };
      });

      // Try to add reaction via API
      await api.addReaction(postId, reaction);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Rollback optimistic update
      setLocalPosts(prev => {
        const originalPost = posts.find(({ post }) => post.id === postId)?.post;
        if (!originalPost) return prev;
        
        return {
          ...prev,
          [postId]: {
            ...originalPost,
            reactions: Math.max(0, originalPost.reactions - 1)
          }
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500">Stories from your family and trusted connections.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1 transition ${filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            All stories
          </button>
          <button
            type="button"
            onClick={() => setFilter('family_only')}
            className={`rounded-full px-3 py-1 transition ${filter === 'family_only' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            Family only
          </button>
          <button
            type="button"
            onClick={() => setFilter('family_and_connections')}
            className={`rounded-full px-3 py-1 transition ${filter === 'family_and_connections' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white hover:text-indigo-600'}`}
          >
            Shared
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No stories to display yet. Share something to kick things off!
          </div>
        ) : (
          filteredPosts.map(({ post, family }) => {
            const ownsPost =
              post.authorId === user?.id ||
              user?.memberships?.some((membership) => membership.memberId === post.authorId);
            const canDeletePost =
              canManageFamily(family.id) || canManageFamily(family.slug) || ownsPost;

            return (
              <article
                key={post.id}
                className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  family.id === highlightFamilyId ? 'ring-2 ring-indigo-200' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {family.name} · {post.visibility === 'family_and_connections' ? 'Shared' : 'Family only'}
                    </p>
                    <h5 className="mt-2 text-lg font-semibold text-slate-900">{post.authorName || 'User'}</h5>
                    
                    {editingPostId === post.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          rows={3}
                          placeholder="What's on your mind?"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEditPost}
                            disabled={savingEdit || !editContent.trim()}
                            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingEdit ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditPost}
                            disabled={savingEdit}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{post.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {canDeletePost && editingPostId !== post.id ? (
                      <>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingPostId === post.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </>
                    ) : null}
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: post.authorAvatarColor }}
                    >
                      {(post.authorName || 'User')
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                  </div>
                </div>
                {post.media ? (
                  <div className="mt-4 overflow-hidden rounded-2xl">
                    {post.media.type === 'image' ? (
                      <div className="relative h-64 w-full">
                        <Image
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
                    onClick={() => handleReaction(post.id, 'like')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
                  >
                    👍 {post.reactions}
                  </button>
                  {post.tags.map((tag) => (
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
            );
          })
        )}
      </div>
      
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
    </div>
  );
}
