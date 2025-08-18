"use client";

import type { KinjarPost } from "@/lib/api"; // <-- use the canonical type
import ReactionBar from "@/components/ReactionBar";
import CommentList from "@/components/CommentList";

export default function PostCard({ post }: { post: KinjarPost }) {
  const author = post.author ?? "Unknown";
  const createdAt =
    post.createdAt ? new Date(post.createdAt).toLocaleString() : "";

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
        {post.kind === "text" && <p style={{ margin: 0 }}>{post.body}</p>}

        {post.kind === "image" && post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            style={{ display: "block", maxWidth: "100%", borderRadius: 8 }}
          />
        )}

        {post.kind === "link" && post.body && (
          <a href={post.body} target="_blank" rel="noreferrer">
            {post.body}
          </a>
        )}
      </div>

      <ReactionBar postId={post.id} />
      <CommentList postId={post.id} />
    </article>
  );
}
