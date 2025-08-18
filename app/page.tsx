"use client";
import { useState } from "react";

export default function Landing() {
  const [fam, setFam] = useState("slaughterbecks");
  return (
    <section className="card" style={{ overflow:"hidden" }}>
      <div className="card-body" style={{ padding:"28px 24px" }}>
        <h1 style={{ fontSize:32, margin:"0 0 8px" }}>Your family’s living time capsule</h1>
        <p className="fade" style={{ margin:"0 0 16px" }}>
          Private by default. Share highlights when you want. Photos, stories, drawings, voice notes — all in one cozy place.
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <a className="btn primary" href={`/feed?family=${encodeURIComponent(fam)}`}>Open your private feed</a>
          <a className="btn ghost" href={`/${encodeURIComponent(fam)}`}>View public page</a>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:14 }}>
          <label className="fade" style={{ minWidth:90 }}>Family name</label>
          <input className="input" style={{ maxWidth:240 }} value={fam} onChange={(e)=>setFam(e.target.value)} />
        </div>
        <div className="hr" />
        <div className="fade" style={{ fontSize:13 }}>
          Try a public page: <a href="https://slaughterbecks.kinjar.com" target="_blank">slaughterbecks.kinjar.com</a>
        </div>
      </div>
    </section>
  );
}
