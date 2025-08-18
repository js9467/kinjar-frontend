"use client";
import { useEffect, useState } from "react";
import { addReaction, getReactions, type Reaction } from "@/lib/api";

const EMOJIS = ["👍","❤️","🎉","🤩","🤔"];

export default function ReactionBar({ postId }: { postId: string }) {
  const [rx, setRx] = useState<Reaction[]>([]);
  useEffect(()=>{ getReactions(postId).then(setRx).catch(()=>setRx([])); },[postId]);

  async function react(emoji: string){
    await addReaction(postId, emoji).catch(()=>{});
    const next = await getReactions(postId).catch(()=>rx);
    setRx(next);
  }

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      {EMOJIS.map(e=>{
        const count = rx.filter(r=>r.emoji===e).length;
        return <button key={e} className="emoji-btn" onClick={()=>react(e)}>{e}{count? ` ${count}`:""}</button>;
      })}
    </div>
  );
}
