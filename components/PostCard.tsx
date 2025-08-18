"use client";

import type { KinjarPost } from "@/lib/api"; // use the API's canonical type
import ReactionBar from "@/components/ReactionBar";
import CommentList from "@/components/CommentList";

export default function PostCard({ post }: { post: KinjarPost }) {
  const author = post.author ?? "Unknown";

  // created_at (API) with fallback to createdAt (legacy)
  const rawCreated = (post as any).created_at ?? (post as any).createdAt ?? null;
  const createdAt =
    typeof rawCreated === "string" && rawCreated
      ? new Date(rawCreated).toLocaleString()
      : "";

  // image_url (API) with fallback to imageUrl (legacy)
  const imageUrl = (post as any).image_url ?? (post as any).imageUrl ?? null;

  // body may be missing for non-text posts—guard it
  const body: string | null =
    typeof (post as any).body === "string" ? (post as any).body : null;

  return (
    <article
      style={{
        border: "1px solid #eee",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <strong>{author}</strong>
        <time style={{ color: "#666", fontSize: 12 }}>{createdAt}</time>
      </header>

      <div style={{ marginBottom: 10 }}>
        {post.kind === "text" && body && <p style={{ margin: 0 }}>{body}</p>}

        {post.kind === "image" && imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{ display: "block", maxWidth: "100%", borderRadius: 8 }}
          />
        )}

        {post.kind === "link" && body && (
          <a href={body} target="_blank" rel="noreferrer">
            {body}
          </a>
        )}
      </div>

      <ReactionBar postId={post.id} />
      <CommentList postId={post.id} />
    </article>
  );
}
