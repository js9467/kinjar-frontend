import { Post } from "@prisma/client";

export async function listPosts(limit = 20): Promise<Post[]> {
  const res = await fetch(`/api/posts?limit=${limit}`, { cache: "no-store" });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Failed to load posts");
  return j.posts as Post[];
}

export async function createPost(input: {
  kind: "TEXT" | "PHOTO" | "VIDEO";
  title?: string;
  body?: string;
  mediaKey?: string;
  mediaType?: string;
  mediaSize?: number;
  isPublic?: boolean;
  audience?: "EVERYONE" | "ADULTS_ONLY" | "KIDS";
  unlockAt?: string;
}) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Failed to create post");
  return j.post as Post;
}

export async function presignUpload(filename: string, contentType: string) {
  const res = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename, contentType }),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Presign failed");
  return j as {
    ok: true;
    key: string;
    maxMB: number;
    put: { url: string; headers: Record<string, string> };
  };
}

const api = { listPosts, createPost, presignUpload };
export default api;
