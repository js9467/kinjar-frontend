'use client';

import React, { useState } from 'react';
import { PostComment, FamilyPost } from '@/lib/types';
import { api } from '@/lib/api';

interface CommentSectionProps {
  post: FamilyPost;
  onCommentAdded?: (comment: PostComment) => void;
  onError?: (error: string) => void;
}

export function CommentSection({ post, onCommentAdded, onError }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(post.comments.length > 0);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // In a real implementation, you'd call an API to add the comment
      // For now, we'll simulate it
      const comment: PostComment = {
        id: `comment-${Date.now()}`,
        authorName: 'Current User', // This would come from auth context
        authorAvatarColor: '#3B82F6', // This would come from auth context
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      onCommentAdded?.(comment);
      setNewComment('');
      setShowComments(true);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment toggle button */}
      {post.comments.length > 0 && (
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
          {showComments ? 'Hide' : 'Show'} {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}
        </button>
      )}

      {/* Comments list */}
      {showComments && post.comments.length > 0 && (
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          {post.comments.map((comment) => (
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                      {new Date(comment.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
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
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-blue-600"
          >
            CU
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