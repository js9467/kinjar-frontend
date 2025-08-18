"use client";
import { useState } from "react";
import { createPostViaProxy } from "@/lib/api";

export default function NewPostForm({ family }: { family: string }) {
  const [kind, setKind] = useState<"text"|"image">("text");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setBusy(true);
    try{
      const payload:any = { kind, public:isPublic, author: author || undefined, family };
      if(kind==="text") payload.body = body;
      else payload.image_url = imageUrl;
      await createPostViaProxy(payload);
      setBody(""); setImageUrl(""); setIsPublic(false);
      window.location.reload();
    }catch(ex:any){ setErr(ex?.message || "Failed to create post"); }
    finally{ setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="card" style={{ background:"#12161e" }}>
      <div className="card-body" style={{ display:"grid", gap:10 }}>
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" className={`btn ${kind==="text"?"primary":"ghost"}`} onClick={()=>setKind("text")}>Text</button>
          <button type="button" className={`btn ${kind==="image"?"primary":"ghost"}`} onClick={()=>setKind("image")}>Image URL</button>
        </div>
        <input className="input" placeholder="Author (optional)" value={author} onChange={e=>setAuthor(e.target.value)} />
        {kind==="text" && <textarea className="textarea" placeholder="Write a memory…" rows={3} value={body} onChange={e=>setBody(e.target.value)} />}
        {kind==="image" && <input className="input" placeholder="https://example.com/photo.jpg" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />}
        <label className="fade" style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input className="checkbox" type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} />
          Make this post public (appears on family page)
        </label>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn primary" disabled={busy} type="submit">{busy?"Posting…":"Post"}</button>
          {err && <span style={{ color:"#ff9aa2" }}>{err}</span>}
        </div>
      </div>
    </form>
  );
}
