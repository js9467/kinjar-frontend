// app/feed/page.tsx

import { getFeed, type Post } from "@/lib/api";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function toStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// Safely get a post's timestamp (camelCase or snake_case)
function createdTs(p: Post): string | undefined {
  return (p as any).createdAt ?? (p as any).created_at;
}

// Month/day match helper that accepts undefined safely
function sameMonthDay(ts: string | undefined, today: Date): boolean {
  if (!ts) return false;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export default async function FeedPage({ searchParams }: PageProps) {
  // Optional: allow ?family= in case you want to preview different tenants
  const fam = toStr(searchParams?.family)?.trim().toLowerCase();

  // Our lib/api.getFeed ignores the arg (cookie-based), but passing a string | undefined is fine.
  const posts: Post[] = await getFeed(fam);

  const today = new Date();
  const onThisDay = posts.filter((p) => sameMonthDay(createdTs(p), today)).slice(0, 3);

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Your Feed</h1>

      {onThisDay.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>On This Day</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {onThisDay.map((p) => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                {(p as any).body ?? (p as any).linkUrl ?? (p as any).link_url ?? "(post)"}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => (
          <article
            key={p.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div style={{ padding: 16 }}>
              <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>
                {(() => {
                  const ts = createdTs(p);
                  return ts ? new Date(ts).toLocaleString() : "—";
                })()}
              </div>

              {p.kind === "text" && (p as any).body && (
                <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{(p as any).body}</p>
              )}

              {p.kind === "image" && ((p as any).mediaUrl ?? (p as any).image_url) && (
                <img
                  src={(p as any).mediaUrl ?? (p as any).image_url}
                  alt=""
                  style={{ display: "block", width: "100%", height: "auto", marginTop: 8, borderRadius: 8 }}
                />
              )}

              {p.kind === "link" && ((p as any).linkUrl ?? (p as any).link_url) && (
                <a
                  href={(p as any).linkUrl ?? (p as any).link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: 8, display: "inline-block", color: "#2563eb", textDecoration: "underline" }}
                >
                  {(p as any).linkUrl ?? (p as any).link_url}
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
