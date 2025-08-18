import { getPublicFeed } from "@/lib/api";

export default async function PublicFamilyPage({ params }: { params: { family: string } }) {
  const posts = await getPublicFeed(params.family);

  return (
    <div>
      <h1>{params.family} — Public Highlights</h1>
      {posts.length === 0 && <p>No public posts yet.</p>}
      {posts.map((p) => (
        <article key={p.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(p.created_at).toLocaleString()}</div>
          {p.kind === "text" && <p style={{ marginTop: 6 }}>{p.body}</p>}
          {p.kind === "image" && p.image_url && (
            <img src={p.image_url} alt="" style={{ marginTop: 8, maxWidth: "100%", borderRadius: 8 }} />
          )}
        </article>
      ))}
    </div>
  );
}