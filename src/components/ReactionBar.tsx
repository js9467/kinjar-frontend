"use client";
import { useState } from "react";

export default function ReactionBar({ postId, onReact }: { postId?: string | number; onReact?: (r: string)=>void }) {
  const [liked, setLiked] = useState(false);
  return (
    <div style={{ display:"flex", gap:12, fontSize:14, opacity:0.8 }}>
      <button onClick={()=>{ setLiked(!liked); onReact?.("like"); }}>
        {liked ? "♥ Liked" : "♡ Like"}
      </button>
      <button onClick={()=>onReact?.("wow")}>Wow</button>
      <button onClick={()=>onReact?.("fun")}>😊</button>
    </div>
  );
}

export { ReactionBar };
