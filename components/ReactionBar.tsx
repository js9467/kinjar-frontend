"use client";
import { useEffect, useState } from "react";
import { addReaction, getReactions, type Reaction } from "@/lib/api";

const EMOJIS = ["👍","❤️","🎉","🤩","🤔"];

export default function ReactionBar({ postId }: { postId: string }) {
  const [rx, setRx] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(){ setLoading(true); try{ setRx(await getReactions(postId)); } finally{ setLoading(false); } }
  useEffect(()=>{ load(); },[postId]);

  async function react(emoji: string){
    await addReaction(postId, emoji);
    load();
  }

  const counts = EMOJIS.map(e => [e, rx.filter(r => r.emoji===e).length] as const);

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:8 }}>
      {EMOJIS.map((e,i)=>(
        <button key={e} onClick={()=>react(e)} style={{ padding:"4px 8px", border:"1px solid #eee", borderRadius:8 }}>
          {e} {counts[i][1] || ""}
        </button>
      ))}
      {loading && <span style={{ fontSize:12, opacity:.6 }}>loading…</span>}
    </div>
  );
}