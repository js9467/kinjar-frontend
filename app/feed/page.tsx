// app/feed/page.tsx
import React from "react";
import { sameMonthDay } from "../../utils/dates";

// Force runtime rendering (prevents static export from running fetch at build)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---- Types ----
type Post = {
  id: string;
  author?: string;
  kind?: "text" | "image" | "link" | string;
  body?: string;
  created_at?: string;
};

// ---- Helpers ----
function getApiBase(): string {
  // Prefer explicit envs; fall back to your public domain
  const env =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.KINJAR_API_URL ||
    "";

  const fallback = "https://api.kinjar.com"; // <-- adjust if needed

  try {
    const base = (env || "").trim() || fallback;
    // Validate URL (throws for invalid)
    new URL(base);
    return base.replace(/\/+$/, ""); // no trailing slash
  } catch {
    return fallback;
  }
}

const hasCreatedAt = (p: Post): p is Post & { created_at: string } =>
  typeof p.created_at === "string" && p.created_at.length > 0;

async function getFeed(fam: string): Promise<Post[]> {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/posts`, {
      method: "GET",
      headers: { "X-Family": fam },
      // no-store ensures runtime fetch, no accidental caching during SSR
      cache: "no-store",
    });
    if (!res.ok) {
      // Swallow and return empty so the page still builds/renders
      console.error("getFeed non-200:", res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as Post[];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("getFeed error:", e);
    return [];
  }
}

async function getFamily(): Promise<string> {
  // Replace with your actual source of truth (headers/cookies/etc.)
  return process.env.NEXT_PUBLIC_DEFAULT_FAMILY || "slaughterbecks";
}

// ---- Page ----
export default async function Page() {
  const fam = await getFamily();
  const posts = await getFeed(fam);
  const today = new Date();

  const onThisDay = posts
    .filter(hasCreatedAt)
    .filter((p) => sameMonthDay(p.created_at, today))
    .slice(0, 3);

  return (
    <div className="grid gap-6 p-6">
      <section>
        <h2 className="text-xl font-semibold mb-3">On This Day</h2>
        {onThisDay.length === 0 ? (
          <p className="text-sm text-neutral-500">No memories for today.</p>
        ) : (
          <ul className="space-y-3">
            {onThisDay.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="text-sm text-neutral-600">
                  {new Date(p.created_at!).toLocaleDateString()}
                </div>
                <div className="mt-1">{p.body || <em>(no text)</em>}</div>
                {p.author && (
                  <div className="mt-2 text-xs text-neutral-500">
                    — {p.author}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Latest</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-neutral-500">No posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {posts.slice(0, 20).map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{p.author || "Anon"}</div>
                  <div className="text-xs text-neutral-500">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="mt-2">{p.body || <em>(no text)</em>}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
