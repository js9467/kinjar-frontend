// app/feed/page.tsx

import { getFeed, type Post } from "@/lib/api";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function toStr(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Prefer camelCase; fall back to snake_case
function createdTs(p: Post): string | undefined {
  const anyp = p as any;
  return anyp.createdAt ?? anyp.created_at;
}

// Accept possibly-undefined and guard inside (prevents TS error)
function sameMonthDay(ts: string | undefined, today: Date): boolean {
  if (!ts) return false;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export default async function FeedPage({ searchParams }: PageProps) {
  const fam = toStr(searchParams?.family)?.trim().toLowerCase();

  // getFeed can accept string | undefined
  const posts: Post[] = await getFeed(fam);

  const onThisDay = posts
  .filter((p) => {
    const ts = (p as any).createdAt ?? (p as any).created_at;
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
                {(p as any).body ??
                  (p as any).linkUrl ??
                  (p as any).link_url ??
                  "(post)"}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => {
          const anyp = p as any;
          const ts = createdTs(p);
          const imageSrc = anyp.mediaUrl ?? anyp.image_url;
          const linkHref = anyp.linkUrl ?? anyp.link_url;

          return (
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
                  {ts ? new Date(ts).toLocaleString() : "—"}
                </div>

                {p.kind === "text" && anyp.body && (
                  <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{anyp.body}</p>
                )}

                {p.kind === "image" && imageSrc && (
                  <img
                    src={imageSrc}
                    alt=""
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  />
                )}

                {p.kind === "link" && linkHref && (
                  <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      color: "#2563eb",
                      textDecoration: "underline",
                    }}
                  >
                    {linkHref}
                  </a>
                )}

                {p.kind === "video" && imageSrc && (
                  <video
                    controls
                    src={imageSrc}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: 8,
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
