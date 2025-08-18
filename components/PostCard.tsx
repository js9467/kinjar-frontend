"use client";
import type { KinjarPost } from "@/lib/api";

export default function PostCard({ post }: { post: KinjarPost }) {
  return (
    <article style={{ border: "1px solid #eee", padding: 12, borderRadius: 10, marginBottom: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        {post.author ? `${post.author} • ` : ""}{new Date(post.created_at).toLocaleString()} {post.public ? "• Public" : "• Private"}
      </div>
      {post.kind === "text" && <p style={{ marginTop: 8 }}>{post.body}</p>}
      {post.kind === "image" && post.image_url && (
        <img src={post.image_url} alt="" style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }} />
      )}
    </article>
  );
}