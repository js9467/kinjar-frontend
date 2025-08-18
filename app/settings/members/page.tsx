import { createMember, getMembers } from "@/lib/api";

export default async function MembersPage() {
  const members = await getMembers();
  return (
    <main style={{ maxWidth:760, margin:"24px auto", padding:"0 16px" }}>
      <h1>Family Members</h1>
      <form action="/settings/members" method="post" data-no-nav>
        {/* handled client-side via a small script block */}
      </form>
      <AddMember />
      <ul style={{ marginTop:16 }}>
        {members.map((m:any)=>(
          <li key={m.id} style={{ padding:"8px 0", borderBottom:"1px solid #eee" }}>
            <b>{m.display_name}</b> — {m.role}{typeof m.age==="number" ? ` • age ${m.age}`:""} {m.birthdate ? ` • ${m.birthdate}`:""}
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";
function AddMember(){
  async function onSubmit(e:any){
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    await createMember({ display_name: String(data.display_name||""), role: String(data.role||"kid"), birthdate: String(data.birthdate||"") || undefined });
    window.location.reload();
  }
  return (
    <form onSubmit={onSubmit} style={{ display:"grid", gap:8, maxWidth:420 }}>
      <h3>Add Member</h3>
      <input name="display_name" placeholder="Name" required />
      <select name="role" defaultValue="kid"><option value="parent">Parent</option><option value="kid">Kid</option><option value="guest">Guest</option></select>
      <input name="birthdate" type="date" placeholder="Birthdate (optional)" />
      <button type="submit">Add</button>
    </form>
  );
}