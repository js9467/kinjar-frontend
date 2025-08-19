"use client";
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.kinjar.com";

// Optional: expose an API key to the browser if your API enforces x-api-key.
// Add NEXT_PUBLIC_KINJAR_API_KEY in Vercel if needed.
const API_KEY = process.env.NEXT_PUBLIC_KINJAR_API_KEY;

export default function MediaPage() {
  const [tenant, setTenant] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const hdrs = useMemo(
    () => ({
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      ...(tenant ? { "x-tenant-slug": tenant } : {}),
      "content-type": "application/json",
      credentials: "include" as any,
    }),
    [tenant]
  );

  useEffect(() => {
    // fetch /auth/me to discover default tenant
    (async () => {
      const me = await fetch(`${API_BASE}/auth/me`, { credentials: "include" }).then(r => r.json()).catch(()=>null);
      const slug = me?.tenants?.[0]?.slug ?? "";
      setTenant(slug);
    })();
  }, []);

  async function refresh() {
    if (!tenant) return;
    const r = await fetch(`${API_BASE}/media/list?tenant=${encodeURIComponent(tenant)}`, {
      headers: API_KEY ? { "x-api-key": API_KEY } : undefined,
      credentials: "include",
      cache: "no-store",
    });
    if (r.ok) setItems((await r.json()).items || []);
  }

  useEffect(() => { refresh(); }, [tenant]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !tenant) return;

    // 1) presign
    const pres = await fetch(`${API_BASE}/presign`, {
      method: "POST",
      headers: {
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        "x-tenant-slug": tenant,
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ filename: f.name, contentType: f.type }),
    }).then(r => r.json());

    // 2) PUT to R2
    await fetch(pres.put.url, { method: "PUT", headers: pres.put.headers, body: f });

    // 3) head to finalize
    await fetch(`${API_BASE}/r2/head?key=${encodeURIComponent(pres.key)}`, {
      headers: API_KEY ? { "x-api-key": API_KEY } : undefined,
      credentials: "include",
    });

    await refresh();
  }

  async function del(key: string) {
    await fetch(`${API_BASE}/media/delete?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: {
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        "x-tenant-slug": tenant,
      },
      credentials: "include",
    });
    await refresh();
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Media</h1>
      <div style={{margin: "12px 0"}}>
        <label>Tenant:&nbsp;
          <input value={tenant} onChange={e=>setTenant(e.target.value)} placeholder="tenant-slug" />
        </label>
      </div>
      <input type="file" onChange={onFile} />
      <ul style={{marginTop:16}}>
        {items.map((it) => (
          <li key={it.id} style={{marginBottom:8}}>
            <code>{it.filename}</code> ({it.size ?? "?"} bytes) – {it.content_type}
            <button onClick={() => del(it.key)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
