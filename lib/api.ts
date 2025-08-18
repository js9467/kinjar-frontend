// lib/api.ts
//
// Frontend helpers that call our Next.js API routes under /app/api/**.
// Those routes add the X-Family header from the cookie set by middleware.ts.
// This keeps client code simple (no family arg) and avoids exposing the upstream base.

import type {
  KinjarPost,
  Comment,
  Reaction,
  Member,
  Capsule,
} from "./types";

/* -------------------------
 * Utilities
 * ------------------------*/

// Simple JSON fetcher for local Next API routes
async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`GET ${path} -> ${res.status}: ${t}`);
  }
  return (await res.json()) as T;
}

async function sendJSON<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body: any): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${method} ${path} -> ${res.status}: ${t}`);
  }
  // some endpoints may return empty body
  try { return (await res.json()) as T; } catch { return undefined as T; }
}

// Normalize common snake→camel cases for the UI when useful
function normalizePost(p: any): KinjarPost {
  return {
    ...p,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,
    mediaUrl:  p.mediaUrl  ?? p.image_url,
    linkUrl:   p.linkUrl   ?? p.link_url,
  };
}

function normalizeCapsule(c: any): Capsule {
  return {
    ...c,
    opensAt: c.opensAt ?? c.opens_at,
    coverUrl: c.coverUrl ?? c.cover_url,
  };
}

/* -------------------------
 * Feed / Posts
 * ------------------------*/

export async function getFeed(_family?: string): Promise<KinjarPost[]> {
  const arr = await getJSON<any[]>("/api/feed");
  return Array.isArray(arr) ? arr.map(normalizePost) : [];
}

// Public feed uses explicit family in the path
export async function getPublicFeed(family: string): Promise<KinjarPost[]> {
  const fam = (family || "").trim().toLowerCase();
  const arr = await getJSON<any[]>(`/api/public/${encodeURIComponent(fam)}/feed`);
  return Array.isArray(arr) ? arr.map(normalizePost) : [];
}

// New post (text or image). UI already passes author/public in payload.
export async function createPostViaProxy(
  payload: { kind: "text" | "image" | "video" | "link"; body?: string; image_url?: string; public?: boolean; author?: string },
  _family?: string
): Promise<KinjarPost> {
  const p = await sendJSON<any>("/api/posts", "POST", payload);
  return normalizePost(p);
}

/* -------------------------
 * Comments
 * ------------------------*/

export async function getComments(postId: string): Promise<Comment[]> {
  return await getJSON<Comment[]>(`/api/posts/${encodeURIComponent(postId)}/comments`);
}

export async function addComment(postId: string, body: string): Promise<Comment> {
  // backend expects { kind, body }, optionally author_member_id
  return await sendJSON<Comment>(`/api/posts/${encodeURIComponent(postId)}/comments`, "POST", {
    kind: "text",
    body,
  });
}

/* -------------------------
 * Reactions
 * ------------------------*/

export async function getReactions(postId: string): Promise<Reaction[]> {
  return await getJSON<Reaction[]>(`/api/posts/${encodeURIComponent(postId)}/reactions`);
}

export async function addReaction(postId: string, emoji: string): Promise<void> {
  await sendJSON<void>(`/api/posts/${encodeURIComponent(postId)}/reactions`, "POST", {
    emoji,
    delta: 1,
  });
}

/* -------------------------
 * Members
 * ------------------------*/

export async function getMembers(_family?: string): Promise<Member[]> {
  const list = await getJSON<Member[]>(`/api/members`);
  return Array.isArray(list) ? list : [];
}

/* -------------------------
 * Capsules
 * ------------------------*/

export async function getCapsules(_family?: string): Promise<Capsule[]> {
  const list = await getJSON<any[]>(`/api/capsules`);
  return Array.isArray(list) ? list.map(normalizeCapsule) : [];
}

/* -------------------------
 * Type re-exports
 * ------------------------*/
export type { KinjarPost, Comment, Reaction, Member, Capsule } from "./types";
// Back-compat alias used in some pages
export type Post = KinjarPost;
