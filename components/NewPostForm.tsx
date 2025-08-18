"use client";
import { useState } from "react";
import { createPostViaProxy } from "@/lib/api"; // <— use the proxy

export default function NewPostForm({ family }: { family: string }) {
  const [kind, setKind] = useState<"text" | "image">("text");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: any = { kind, public: isPublic, author: author || undefined, family };
      if (kind === "text") payload.body = body;
      if (kind === "image") payload.image_url = imageUrl;

      await createPostViaProxy(payload);
      // reset
      setBody("");
      setImageUrl("");
      // refresh the page data
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
      <h3>New Post</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <label><input type="radio" name="kind" checked={kind === "text"} onChange={() => setKind("text")} /> Text</label>
        <label><input type="radio" name="kind" checked={kind === "image"} onChange={() => setKind("image")} /> Image URL</label>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <input placeholder="Author (optional)" value={author} onChange={e => setAuthor(e.target.value)} />
        {kind === "text" && (
          <textarea placeholder="Say something..." value={body} onChange={e => setBody(e.target.value)} rows={3} />
        )}
        {kind === "image" && (
          <input placeholder="https://example.com/photo.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        )}
        <label>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /> Make this post public
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post"}
        </button>
        {error && <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>}
      </div>
    </form>
  );
}