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
