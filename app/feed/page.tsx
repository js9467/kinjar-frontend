// app/feed/page.tsx

import { getFeed, type Post } from "@/lib/api";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function toStr(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Safely get a post's timestamp (camelCase or snake_case)
function createdTs(p: Post): string | undefined {
  // Allow mixed casing from the backend without breaking type-checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyp = p as any;
  return anyp.createdAt ?? anyp.created_at;
}

// Month/day match helper (expects a defined string)
function sameMonthDay(ts: string, today: Date): boolean {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export default async function FeedPage({ searchParams }: PageProps) {
  // Optional: allow ?family= to preview different tenants; getFeed ignores it if you rely on cookies
  const fam = toStr(searchParams?.family)?.trim().toLowerCase();

  // lib/api.getFeed accepts string | undefined, so this is fine
  const posts: Post[] = await getFeed(fam);

  const today = new Date();
  const onThisDay = posts
    .filter((p) => {
      const ts = createdTs(p);
      return ts ? sameMonthDay(ts, today) : false;
    })
    .slice(0, 3);

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Your Feed</h1>

      {onThisDay.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>On This Day</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {onThisDay.map((p) => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                {/* Prefer body; fall back to link text if present */}
                {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((p as any).body ??
                    (p as any).linkUrl ??
                    (p as any).link_url ??
                    "(post)")
                }
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

              {/* TEXT */}
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                p.kind === "text" && (p as any).body && (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{(p as any).body}</p>
                )
              }

              {/* IMAGE */}
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyp = p as any;
                const src = anyp.mediaUrl ?? anyp.image_url;
                return p.kind === "image" && src ? (
                  <img
                    src={src}
                    alt=""
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  />
                ) : null;
              })()}

              {/* LINK */}
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyp = p as any;
                const href = anyp.linkUrl ?? anyp.link_url;
                return p.kind === "link" && href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      color: "#2563eb",
                      textDecoration: "underline",
                    }}
                  >
                    {href}
                  </a>
                ) : null;
              })()}

              {/* VIDEO (simple) */}
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const anyp = p as any;
                const src = anyp.mediaUrl ?? anyp.image_url;
                return p.kind === "video" && src ? (
                  <video
                    controls
                    src={src}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  />
                ) : null;
              })()}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
