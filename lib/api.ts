// lib/api.ts

// Centralized API helpers and types for the frontend.

import type {
  KinjarPost,
  KinjarComment,
  ReactionSummary,
  NewPostPayload,
  Member,
  Capsule,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Basic fetch wrapper with family header.
async function apiFetch<T>(
  path: string,
  family: string,
  init?: RequestInit
): Promise<T> {
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'X-Family': family,
      ...(init?.headers || {}),
    },
    // Use no-store to avoid stale caches on dynamic feeds
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text || path}`);
  }
  // Some endpoints may return empty body on 204
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* -------------------------
 * Posts / Feed
 * ------------------------*/

// Full private feed (auth by family header)
export async function getFeed(family: string): Promise<KinjarPost[]> {
  return apiFetch<KinjarPost[]>(`/posts`, family);
}

// Public feed variant; if you have a distinct public route, update here.
export async function getPublicFeed(family: string): Promise<KinjarPost[]> {
  // If your API exposes /public/posts, swap the path:
  // return apiFetch<KinjarPost[]>(`/public/posts`, family);
  return apiFetch<KinjarPost[]>(`/posts`, family);
}

// Create a post (proxied through the API)
// If your UI sends FormData for uploads, overload later as needed.
export async function createPostViaProxy(
  payload: NewPostPayload,
  family: string
): Promise<KinjarPost> {
  return apiFetch<KinjarPost>(`/posts`, family, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/* -------------------------
 * Comments
 * ------------------------*/

export async function getComments(
  postId: string,
  family: string
): Promise<KinjarComment[]> {
  return apiFetch<KinjarComment[]>(`/posts/${encodeURIComponent(postId)}/comments`, family);
}

export async function addComment(
  postId: string,
  body: string,
  author: string,
  family: string
): Promise<KinjarComment> {
  return apiFetch<KinjarComment>(`/posts/${encodeURIComponent(postId)}/comments`, family, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, author }),
  });
}

/* -------------------------
 * Reactions
 * ------------------------*/

export async function getReactions(
  postId: string,
  family: string
): Promise<ReactionSummary> {
  return apiFetch<ReactionSummary>(`/posts/${encodeURIComponent(postId)}/reactions`, family);
}

export async function addReaction(
  postId: string,
  reaction: string,
  delta: 1 | -1,
  family: string
): Promise<void> {
  await apiFetch<void>(`/posts/${encodeURIComponent(postId)}/reactions`, family, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction, delta }),
  });
}

/* -------------------------
 * Members (kids page likely uses this)
 * ------------------------*/

export async function getMembers(family: string): Promise<Member[]> {
  // Adjust path to your API route if different (e.g., /members or /users)
  return apiFetch<Member[]>(`/members`, family);
}

/* -------------------------
 * Capsules
 * ------------------------*/

export async function getCapsules(family: string): Promise<Capsule[]> {
  return apiFetch<Capsule[]>(`/capsules`, family);
}

/* -------------------------
 * Type re-exports
 * ------------------------*/

// Re-export types so callers can import from "@/lib/api"
export type {
  KinjarPost,
  KinjarComment,
  ReactionSummary,
  NewPostPayload,
  Member,
  Capsule,
} from './types';

// Back-compat alias for pages/components that import `type Post`
export type Post = KinjarPost;
