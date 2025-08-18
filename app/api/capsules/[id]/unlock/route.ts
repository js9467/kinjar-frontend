export const runtime = "nodejs";
import { cookies } from "next/headers";
import { API_BASE } from "../../../_upstream";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  if (!API_BASE) return new Response("KINJAR_API_BASE not set", { status: 500 });
  const fam = cookies().get("family")?.value;
  if (!fam) {
    return new Response(JSON.stringify({ ok: false, error: "Missing family" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const u = await fetch(`${API_BASE}/capsules/${params.id}/unlock`, {
    method: "POST",
    headers: { "X-Family": fam },
    cache: "no-store",
  });
  return new Response(await u.text(), {
    status: u.status,
    headers: { "content-type": u.headers.get("content-type") || "application/json" },
  });
}
