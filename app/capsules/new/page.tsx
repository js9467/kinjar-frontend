"use client";
import { createCapsule, getMembers } from "@/lib/api";
import { useEffect, useState } from "react";

export default function NewCapsule(){
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ getMembers().then(setMembers).catch(()=>setMembers([])); },[]);

  async function onSubmit(e:any){
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const release_type = String(fd.get("release_type"));
    const release_value = release_type==="age" ? Number(fd.get("release_value")) : String(fd.get("release_value"));
    try{
      await createCapsule({
        title: String(fd.get("title")||"Untitled"),
        message: String(fd.get("message")||""),
        media: [],
        release_type,
        release_value,
        for_member_id: String(fd.get("for_member_id")||"") || undefined,
        guardians: [],
        public: false
      });
      window.location.href = "/capsules";
    }catch(err:any){
      setError(err?.message || "Failed to create capsule");
    }
  }

  return (
    <main style={{ maxWidth:760, margin:"24px auto", padding:"0 16px" }}>
      <h1>New Capsule</h1>
      <form onSubmit={onSubmit} style={{ display:"grid", gap:10, maxWidth:520 }}>
        <input name="title" placeholder="Title" required />
        <textarea name="message" placeholder="Message to future..." rows={4} />
        <label>For child:
          <select name="for_member_id" defaultValue="">
            <option value="">— Optional —</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.display_name}</option>)}
          </select>
        </label>
        <label>Release by:
          <select name="release_type" defaultValue="age">
            <option value="age">Age</option>
            <option value="date">Date</option>
          </select>
        </label>
        <div>
          <small>For Age: enter number (e.g., 18). For Date: ISO date (YYYY-MM-DD).</small>
          <input name="release_value" placeholder="18 or 2039-05-01" required />
        </div>
        <button type="submit">Create</button>
        {error && <div style={{ color:"crimson" }}>{error}</div>}
      </form>
    </main>
  );
}