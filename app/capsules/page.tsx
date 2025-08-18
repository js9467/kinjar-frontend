import { getCapsules } from "@/lib/api";

export default async function CapsulesPage(){
  const caps = await getCapsules();
  return (
    <main style={{ maxWidth:760, margin:"24px auto", padding:"0 16px" }}>
      <h1>Time Capsules</h1>
      <a href="/capsules/new">Create capsule</a>
      <ul style={{ marginTop:16 }}>
        {caps.map((c:any)=>(
          <li key={c.id} style={{ padding:"10px 0", borderBottom:"1px solid #eee" }}>
            <b>{c.title}</b> — {c.status}
            <div style={{ fontSize:12, opacity:.7 }}>{new Date(c.created_at).toLocaleString()}</div>
            <div>{c.message}</div>
          </li>
        ))}
        {caps.length===0 && <li>No capsules yet.</li>}
      </ul>
    </main>
  );
}