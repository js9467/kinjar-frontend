import { headers } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.kinjar.com";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const r = await fetch(`${API_BASE}/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) return <main style={{padding:24}}>Not signed in.</main>;
  const me = await r.json();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>My Account</h1>
      <pre style={{background:"#f6f6f6", padding:12, borderRadius:8}}>
        {JSON.stringify(me, null, 2)}
      </pre>
      <form action="/logout" method="post" style={{marginTop:12}}>
        <button>Sign out</button>
      </form>
    </main>
  );
}
