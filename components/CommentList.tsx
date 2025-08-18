"use client";
import { useEffect, useState } from "react";
import { addComment, getComments, type Comment } from "@/lib/api";

export default function CommentList({ postId }: { postId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  async function load(){ setItems(await getComments(postId)); }
  useEffect(()=>{ load(); },[postId]);
  async function submit(e: React.FormEvent){ e.preventDefault(); if(!text.trim()) return; await addComment(postId, text.trim()); setText(""); load(); }

  return (
    <div style={{ marginTop:8 }}>
      <form onSubmit={submit} style={{ display:"flex", gap:6 }}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment…" style={{ flex:1 }}/>
        <button type="submit">Send</button>
      </form>
      <ul style={{ listStyle:"none", padding:0, marginTop:8 }}>
        {items.map(c=>(
          <li key={c.id} style={{ padding:"6px 8px", background:"#fafafa", border:"1px solid #eee", borderRadius:8, marginBottom:6 }}>
            <div style={{ fontSize:12, opacity:.6 }}>{new Date(c.created_at).toLocaleString()}</div>
            {c.kind==="text" && c.body}
          </li>
        ))}
        {items.length===0 && <li style={{ fontSize:12, opacity:.6 }}>No comments yet.</li>}
      </ul>
    </div>
  );
}