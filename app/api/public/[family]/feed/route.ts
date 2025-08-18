export const runtime = "nodejs";
import { API_BASE } from "../../../_upstream";


export async function GET(_: Request, { params }: { params: { family: string } }) {
  if (!API_BASE) return new Response("KINJAR_API_BASE not set", { status: 500 });
  const fam = (params.family || "").trim().toLowerCase();
  if (!fam) {
    return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  }

  // Try dedicated public endpoint first
  const primary = await fetch(`${API_BASE}/public/${encodeURIComponent(fam)}/posts`, { cache: "no-store" });

  if (primary.ok) {
    return new Response(await primary.text(), {
      status: 200,
      headers: { "content-type": primary.headers.get("content-type") || "application/json" },
    });
  }

  // Fallback: fetch regular posts for the family, then filter to public on the edge
  const alt = await fetch(`${API_BASE}/posts`, {
    headers: { "X-Family": fam },
    cache: "no-store",
  });

  const text = await alt.text();
  let arr: any[] = [];
  try { arr = JSON.parse(text); } catch { arr = []; }
  const onlyPublic = Array.isArray(arr) ? arr.filter((p) => p?.public) : [];
  return new Response(JSON.stringify(onlyPublic), {
    status: alt.ok ? 200 : alt.status,
    headers: { "content-type": "application/json" },
  });
}
