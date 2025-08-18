const API_BASE = process.env.KINJAR_API_BASE!;

export async function createPostViaProxy(
  data: { kind: "text" | "image"; body?: string; image_url?: string; public?: boolean; author?: string; family?: string }
) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `POST /api/posts failed (${res.status})`);
  }
  return res.json();
}

export type KinjarPost = {
  id: string;
  kind: "text" | "image";
  body?: string;
  image_url?: string;
  created_at: string;
  public: boolean;
  author?: string;
};

async function kinFetch(
  path: string,
  opts: RequestInit & { family: string }
) {
  const { family, ...rest } = opts;
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(rest.headers || {}),
      "X-Family": family
    },
    // Don’t cache private feeds
    cache: "no-store"
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${msg}`);
  }
  return res;
}

export async function getFeed(family: string): Promise<KinjarPost[]> {
  const res = await kinFetch(`/posts`, { family, method: "GET" });
  return res.json();
}

export async function getPublicFeed(family: string): Promise<KinjarPost[]> {
  const res = await kinFetch(`/posts?public=1`, { family, method: "GET" });
  return res.json();
}

export async function createPost(
  family: string,
  data: { kind: "text" | "image"; body?: string; image_url?: string; public?: boolean; author?: string }
) {
  const res = await kinFetch(`/posts`, {
    family,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
// lib/api.ts
export type Member = { id: string; display_name: string; role: "parent"|"kid"|"guest"|string; birthdate?: string|null; avatar_url?: string|null; interests?: string[]; age?: number|null; };
export type Reaction = { id: string; post_id: string; emoji: string; author_member_id?: string|null; created_at: string; };
export type Comment = { id: string; post_id: string; kind: "text"|"voice"|"sticker"; body?: string|null; media_url?: string|null; author_member_id?: string|null; created_at: string; };
export type Capsule = { id: string; title: string; message: string; media: string[]; release_type: "date"|"age"; release_value: any; for_member_id?: string|null; guardians: string[]; public: boolean; status: "locked"|"unlocked"; created_at: string; };

export async function getMembers(){ const r=await fetch("/api/members",{cache:"no-store"}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function createMember(m: Partial<Member>){ const r=await fetch("/api/members",{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify(m)}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

export async function getReactions(postId: string){ const r=await fetch(`/api/posts/${postId}/reactions`,{cache:"no-store"}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function addReaction(postId: string, emoji: string, author_member_id?: string){ const r=await fetch(`/api/posts/${postId}/reactions`,{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify({emoji, author_member_id})}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

export async function getComments(postId: string){ const r=await fetch(`/api/posts/${postId}/comments`,{cache:"no-store"}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function addComment(postId: string, body: string, author_member_id?: string){ const r=await fetch(`/api/posts/${postId}/comments`,{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify({kind:"text", body, author_member_id})}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

export async function getCapsules(){ const r=await fetch("/api/capsules",{cache:"no-store"}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function createCapsule(c: Partial<Capsule>){ const r=await fetch("/api/capsules",{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify(c)}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function unlockCapsule(id: string){ const r=await fetch(`/api/capsules/${id}/unlock`,{method:"POST"}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

