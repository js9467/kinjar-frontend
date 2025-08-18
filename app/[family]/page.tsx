// app/[family]/page.tsx

import { getPublicFeed, type Post } from "../../lib/api";

type PageProps = {
  params: { family: string };
};

function formatWhen(p: Post): string {
  const ts = (p as any).createdAt ?? (p as any).created_at;
  return ts ? new Date(ts).toLocaleString() : "—";
}

function imageSrc(p: Post): string | undefined {
  // Prefer camelCase, fallback to snake_case
  const media = (p as any).mediaUrl ?? (p as any).image_url;
  return typeof media === "string" ? media : undefined;
}

export default async function PublicFamilyPage({ params }: PageProps) {
  const family: string = params.family?.trim().toLowerCase();
  const posts: Post[] = await getPublicFeed(family);

  return (
    <main className="container" style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        {family} • Public Feed
      </h1>

      {posts.length === 0 && (
        <div className="card" style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <p style={{ margin: 0 }}>No posts yet.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => (
          <article
            key={p.id}
            className="card"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div className="card-body" style={{ padding: 16 }}>
              <div className="meta" style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>
                {formatWhen(p)} • Public
              </div>

              {/* TEXT */}
              {p.kind === "text" && (p as any).body && (
                <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{(p as any).body}</p>
              )}

              {/* IMAGE */}
              {p.kind === "image" && imageSrc(p) && (
                <img
                  src={imageSrc(p)}
                  alt=""
                  style={{ display: "block", width: "100%", height: "auto", marginTop: 8, borderRadius: 8 }}
                />
              )}

              {/* LINK */}
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

              {/* VIDEO (simple) */}
              {p.kind === "video" && imageSrc(p) && (
                <video
                  controls
                  src={imageSrc(p)}
                  style={{ display: "block", width: "100%", marginTop: 8, borderRadius: 8 }}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
