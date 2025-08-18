import { headers, cookies } from "next/headers";

export default async function DebugPage() {
  const host = headers().get("host") || "";
  const familyCookie = cookies().get("family")?.value || "(none)";
  const apiBase = process.env.KINJAR_API_BASE || "(missing)";

  let health = "skipped";
  if (apiBase !== "(missing)") {
    try {
      const r = await fetch(`${apiBase}/health`, { cache: "no-store" });
      const t = await r.text();
      health = `${r.status} ${t}`;
    } catch (e: any) {
      health = `ERROR: ${e?.message || String(e)}`;
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: 16 }}>
      <h1>Debug</h1>
      <ul>
        <li><b>Host:</b> {host}</li>
        <li><b>Cookie family:</b> {familyCookie}</li>
        <li><b>KINJAR_API_BASE:</b> {apiBase}</li>
        <li><b>API /health:</b> {health}</li>
      </ul>
      <p>Tip: visit this on a subdomain too, e.g. <code>https://slaughterbecks.kinjar.com/debug</code></p>
    </main>
  );
}