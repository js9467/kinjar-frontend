'use client';

import React, { useState, useEffect } from 'react';
import { PostComment, FamilyPost } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface CommentSectionProps {
  post: FamilyPost;
  onCommentAdded?: (comment: PostComment) => void;
  onError?: (error: string) => void;
}

export function CommentSection({ post, onCommentAdded, onError }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [showComments, setShowComments] = useState((post.comments || []).length > 0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Update comments when post.comments changes
  useEffect(() => {
    console.log('[CommentSection] Post comments updated:', post.id, post.comments?.length || 0);
    setComments(post.comments || []);
    setShowComments((post.comments || []).length > 0);
  }, [post.comments, post.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!user) {
      onError?.('You must be logged in to comment');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[CommentSection] Adding comment to post:', post.id);
      console.log('[CommentSection] Comment content:', newComment.trim());
      
      // Add comment via API
      const comment = await api.addComment(post.id, newComment.trim());
      console.log('[CommentSection] Comment added successfully:', comment);
      
      // Update local comments immediately
      setComments(prev => [...prev, comment]);
      setShowComments(true);
      
      // Call the callback to update the parent component
      onCommentAdded?.(comment);
      
      // Reset form
      setNewComment('');
      
    } catch (error) {
      console.error('[CommentSection] Failed to add comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingCommentId) return;

    setSavingEdit(true);
    try {
      console.log('[CommentSection] Editing comment:', editingCommentId);
      
      // Edit comment via API
      const updatedComment = await api.editComment(editingCommentId, editContent.trim());
      console.log('[CommentSection] Comment edited successfully:', updatedComment);
      
      // Update local comments
      setComments(prev => prev.map(comment => 
        comment.id === editingCommentId 
          ? { ...comment, content: updatedComment.content }
          : comment
      ));
      
      // Reset edit state
      setEditingCommentId(null);
      setEditContent('');
      
    } catch (error) {
      console.error('[CommentSection] Failed to edit comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit comment';
      onError?.(errorMessage);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = async (comment: PostComment) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.deleteComment(comment.id);
      
      // Remove comment from local state
      setComments(prev => prev.filter(c => c.id !== comment.id));
      
      console.log('[CommentSection] Comment deleted successfully');
    } catch (error) {
      console.error('[CommentSection] Failed to delete comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      onError?.(errorMessage);
    }
  };

  // Check if user can edit a comment (same logic as backend)
  const canEditComment = (comment: PostComment): boolean => {
    if (!user) return false;
    
    // User can edit their own comments
    if (comment.authorName === user.name) return true;
    
    // Adults/admins can edit child comments
    // For now, we'll allow editing if the user is an adult (this should match the backend logic)
    // In a more complete implementation, we'd check if the comment author is a child
    const userRole = user.memberships?.find(m => m.familySlug === post.familySlug)?.role;
    return userRole === 'ADMIN' || userRole === 'ADULT';
  };

  // Check if user can delete a comment
  const canDeleteComment = (comment: PostComment): boolean => {
    if (!user) return false;
    
    const userRole = user.memberships?.find(m => m.familySlug === post.familySlug)?.role;
    
    // ADMINs can delete any comment
    if (userRole === 'ADMIN') return true;
    
    // Adults can delete their own comments or child comments from their family
    if (userRole === 'ADULT') {
      // Can delete own comments
      if (comment.authorName === user.name) return true;
      
      // Can delete child comments (this logic would need more sophisticated checking in a real app)
      // For now, we'll be conservative and only allow deleting own comments unless admin
      return false;
    }
    
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Comment toggle button */}
      {comments.length > 0 && (
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${showComments ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          {showComments ? 'Hide' : 'Show'} {comments.length} comment{comments.length === 1 ? '' : 's'}
        </button>
      )}

      {/* Comments list */}
      {showComments && comments.length > 0 && (
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: comment.authorAvatarColor }}
              >
                {comment.authorName
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(comment.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {(canEditComment(comment) || canDeleteComment(comment)) && editingCommentId !== comment.id && (
                      <div className="flex items-center gap-2">
                        {canEditComment(comment) && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Edit
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={savingEdit}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={savingEdit || !editContent.trim()}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingEdit ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          className="px-3 py-1 text-gray-700 text-xs font-medium hover:text-gray-900 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex gap-3">
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}
          >
            {user?.name
              ? user.name.split(' ').map(part => part[0]).join('').slice(0, 2)
              : 'CU'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              rows={2}
              disabled={submitting}
            />
          </div>
        </div>
        
        {newComment.trim() && (
          <div className="flex justify-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

interface PostReactionsProps {
  post: FamilyPost;
  onReaction?: (postId: string, reaction: string) => void;
}

export function PostReactions({ post, onReaction }: PostReactionsProps) {
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const reactions = [
    { emoji: '❤️', name: 'love', count: Math.floor(post.reactions * 0.4) },
    { emoji: '😊', name: 'happy', count: Math.floor(post.reactions * 0.3) },
    { emoji: '👏', name: 'clap', count: Math.floor(post.reactions * 0.2) },
    { emoji: '😮', name: 'wow', count: Math.floor(post.reactions * 0.1) }
  ];

  const handleReaction = (reactionName: string) => {
    setUserReaction(userReaction === reactionName ? null : reactionName);
    onReaction?.(post.id, reactionName);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {reactions.map((reaction) => (
          <button
            key={reaction.name}
            onClick={() => handleReaction(reaction.name)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
              userReaction === reaction.name
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-base">{reaction.emoji}</span>
            {reaction.count > 0 && <span className="text-xs font-medium">{reaction.count}</span>}
          </button>
        ))}
      </div>
      
      {post.reactions > 0 && (
        <span className="text-sm text-gray-500">
          {post.reactions} reaction{post.reactions === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}