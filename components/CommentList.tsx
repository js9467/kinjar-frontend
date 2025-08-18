"use client";
import { useEffect, useState } from "react";
import { addComment, getComments, type Comment } from "@/lib/api";

export default function CommentList({ postId }: { postId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  async function load(){ setItems(await getComments(postId).catch(()=>[])); }
  useEffect(()=>{ if(open) load(); },[open, postId]);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    if(!text.trim()) return;
    await addComment(postId, text.trim()).catch(()=>{});
    setText(""); load();
  }

  return (
    <div style={{ marginTop:8 }}>
      <button className="btn ghost" onClick={()=>setOpen(!open)}>{open ? "Hide" : "Comments"} ({items.length})</button>
      {open && (
        <div className="card" style={{ marginTop:8 }}>
          <div className="card-body">
            <form onSubmit={submit} style={{ display:"flex", gap:8, marginBottom:10 }}>
              <input className="input" placeholder="Add a comment…" value={text} onChange={e=>setText(e.target.value)} />
              <button className="btn" type="submit">Send</button>
            </form>
            <div style={{ display:"grid", gap:8 }}>
              {items.map(c=>(
                <div key={c.id} className="card" style={{ background:"#0f141b" }}>
                  <div className="card-body">
                    <div className="meta">{new Date(c.created_at).toLocaleString()}</div>
                    {c.kind==="text" && <div style={{ marginTop:6 }}>{c.body}</div>}
                  </div>
                </div>
              ))}
              {items.length===0 && <div className="fade">Be the first to comment.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
