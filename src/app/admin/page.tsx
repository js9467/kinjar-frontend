"use client";
import { useState } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({ name: "", slug: "", ownerEmail: "" });
  const [msg, setMsg] = useState("");

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Working...");
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    setMsg(j.ok ? `Created ${j.tenant.slug}` : `Error: ${j.error}`);
  }

  function exitAdmin() {
    localStorage.setItem("adminMode", "0");
    window.location.href = "/";
  }

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1>ROOT Admin</h1>
      <form onSubmit={createTenant} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Family name" value={form.name}
               onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="slug (subdomain)" value={form.slug}
               onChange={e=>setForm({...form, slug:e.target.value})}/>
        <input placeholder="Owner email" value={form.ownerEmail}
               onChange={e=>setForm({...form, ownerEmail:e.target.value})}/>
        <button type="submit">Create Tenant</button>
      </form>
      <p>{msg}</p>
      <hr />
      <button onClick={exitAdmin}>Exit administration mode</button>
    </div>
  );
}
