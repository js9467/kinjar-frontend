// app/[family]/page.tsx
import { getPublicFeed, type Post } from "../../lib/api";

export default async function PublicFamilyPage({ params }: { params: { family: string } }) {
  const family: string = params.family?.trim().toLowerCase();
  let posts: Post[] = [];
  try {
    posts = await getPublicFeed(family);
  } catch {
    posts = [];
  }

  return (
    <section className="card">
      <div className="card-body">
        <h1 className="card-title" style={{ textTransform: "capitalize" }}>{family}</h1>
        <p className="fade">Public highlights</p>
        <div className="hr" />
        <div style={{ display: "grid", gap: 12 }}>
          {posts.map((p) => (
            <article key={p.id} className="card" style={{ background:"#12161e" }}>
              <div className="card-body">
                <div className="meta">
                  {new Date(p.created_at).toLocaleString()} • Public
                </div>
                {p.kind === "text" && p.body && <p style={{ marginTop: 8 }}>{p.body}</p>}
                {p.kind === "image" && p.image_url && (
                  <img
                    src={p.image_url}
                    alt=""
                    style={{ width: "100%", borderRadius: 12, marginTop: 10, border: "1px solid var(--line)" }}
                  />
                )}
              </div>
            </article>
          ))}
          {posts.length === 0 && <div className="fade">No public posts yet.</div>}
        </div>
        <div className="hr" />
        <a className="btn ghost" href={`/feed?family=${encodeURIComponent(family)}`}>Open private feed</a>
      </div>
    </section>
  );
}
