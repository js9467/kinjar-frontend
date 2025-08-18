export type Post = { id: string; kind: "text"|"image"; body?: string|null; image_url?: string|null; public: boolean; author?: string|null; created_at: string; };
export type Reaction = { id: string; post_id: string; emoji: string; author_member_id?: string|null; created_at: string; };
export type Comment = { id: string; post_id: string; kind: "text"|"voice"|"sticker"; body?: string|null; media_url?: string|null; author_member_id?: string|null; created_at: string; };
export type Member = { id: string; display_name: string; role: string; birthdate?: string|null; avatar_url?: string|null; interests?: string[]; age?: number|null; };
export type Capsule = { id: string; title: string; message: string; media: string[]; release_type: "date"|"age"; release_value: any; for_member_id?: string|null; guardians: string[]; public: boolean; status: "locked"|"unlocked"; created_at: string; };

async function j<T>(r: Response){ if(!r.ok) throw new Error(await r.text()); return r.json() as Promise<T>; }

export async function getFeed(_family?: string){ return j<Post[]>(await fetch("/api/feed",{ cache:"no-store" })); }
export async function createPostViaProxy(payload: Partial<Post> & { family?: string }){ return j<Post>(await fetch("/api/posts",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) })); }

export async function getReactions(postId: string){ return j<Reaction[]>(await fetch(`/api/posts/${postId}/reactions`,{ cache:"no-store" })); }
export async function addReaction(postId: string, emoji: string, author_member_id?: string){ return j<Reaction>(await fetch(`/api/posts/${postId}/reactions`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ emoji, author_member_id }) })); }

export async function getComments(postId: string){ return j<Comment[]>(await fetch(`/api/posts/${postId}/comments`,{ cache:"no-store" })); }
export async function addComment(postId: string, body: string, author_member_id?: string){ return j<Comment>(await fetch(`/api/posts/${postId}/comments`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ kind:"text", body, author_member_id }) })); }

export async function getMembers(){ return j<Member[]>(await fetch("/api/members",{ cache:"no-store" })); }
export async function createMember(m: Partial<Member>){ return j<Member>(await fetch("/api/members",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(m) })); }

export async function getCapsules(){ return j<Capsule[]>(await fetch("/api/capsules",{ cache:"no-store" })); }
export async function createCapsule(c: Partial<Capsule>){ return j<Capsule>(await fetch("/api/capsules",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(c) })); }
export async function unlockCapsule(id: string){ return j<Capsule>(await fetch(`/api/capsules/${id}/unlock`,{ method:"POST" })); }
