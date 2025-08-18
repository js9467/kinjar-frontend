"use client";
import { useState } from "react";
import { createPost } from "@/lib/api";

export default function NewPostForm({ family }: { family: string }) {
  const [kind, setKind] = useState<"text" | "image">("text");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [author, setAuthor] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = { kind, public: isPublic };
    if (author) payload.author = author;
    if (kind === "text") payload.body = body;
    if (kind === "image") payload.image_url = imageUrl;

    await createPost(family, payload);
    // soft reset
    setBody("");
    setImageUrl("");
    // reload the page data
    window.location.reload();
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
        <button type="submit">Post</button>
      </div>
    </form>
  );
}