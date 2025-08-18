// app/feed/page.tsx
import React from "react";
import { sameMonthDay } from "@/utils/dates";

// If you already have this type elsewhere, use that instead.
type Post = {
  id: string;
  author?: string;
  kind?: "text" | "image" | "link" | string;
  body?: string;
  created_at?: string; // <-- may be undefined in your data, hence the guard below
};

// If getFeed is defined elsewhere, keep that import.
// This placeholder shows the expected signature/shape.
async function getFeed(fam: string): Promise<Post[]> {
  // Replace with your actual data fetch:
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
    headers: { "X-Family": fam },
    // If this page is a server component (default), you can cache/revalidate as needed:
    // next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return (await res.json()) as Post[];
}

// Narrowing helper so TypeScript knows created_at is a string after the filter.
const hasCreatedAt = (p: Post): p is Post & { created_at: string } =>
  typeof p.created_at === "string" && p.created_at.length > 0;

// If you’re reading family from headers, cookies, or searchParams, adjust here.
async function getFamily(): Promise<string> {
  // Example: read from env or default
  return process.env.NEXT_PUBLIC_DEFAULT_FAMILY || "slaughterbecks";
}

export default async function Page() {
  const fam = await getFamily();
  const posts = await getFeed(fam);
  const today = new Date();

  // ✅ Type-safe: first ensure created_at exists, then call sameMonthDay
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
