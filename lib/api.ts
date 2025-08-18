// lib/api.ts

// (existing imports and functions...)

// Re-export types so callers can do: import type { KinjarPost } from '@/lib/api'
export type { KinjarPost, KinjarComment, ReactionPayload, PostKind } from './types';

// Optionally, type your API functions:
import type { KinjarPost, KinjarComment, ReactionPayload } from './types';

export async function getPosts(family: string): Promise<KinjarPost[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
    headers: { 'X-Family': family },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
}

export async function getPost(id: string, family: string): Promise<KinjarPost> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
    headers: { 'X-Family': family },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load post');
  return res.json();
}

export async function getComments(postId: string, family: string): Promise<KinjarComment[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
    headers: { 'X-Family': family },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load comments');
  return res.json();
}

export async function react(payload: ReactionPayload, family: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${payload.postId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Family': family,
    },
    body: JSON.stringify({ reaction: payload.reaction, delta: payload.delta }),
  });
  if (!res.ok) throw new Error('Failed to update reaction');
}
