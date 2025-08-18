export const runtime = "nodejs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { API_BASE } from "../_upstream";

export async function POST(req: NextRequest) {
  if (!API_BASE) return new Response("KINJAR_API_BASE not set", { status: 500 });
  let payload: any; try { payload = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
  const fam = payload?.family || cookies().get("family")?.value;
  if (!fam) return new Response("Missing family", { status: 400 });

  const u = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Family": fam },
    body: JSON.stringify({
      kind: payload.kind, body: payload.body, image_url: payload.image_url,
      public: !!payload.public, author: payload.author || undefined
    }),
    cache: "no-store"
  });
  return new Response(await u.text(), { status: u.status, headers: { "content-type": u.headers.get("content-type") || "application/json" } });
}