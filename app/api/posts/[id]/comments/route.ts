export const runtime = "nodejs";
import { cookies } from "next/headers";
import { API_BASE } from "../../../_upstream";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const fam = cookies().get("family")?.value;
  if (!API_BASE || !fam) return new Response("Missing", { status: 400 });
  const u = await fetch(`${API_BASE}/posts/${params.id}/comments`, { headers: { "X-Family": fam }, cache: "no-store" });
  return new Response(await u.text(), { status: u.status, headers: { "content-type": u.headers.get("content-type") || "application/json" } });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const fam = cookies().get("family")?.value;
  if (!API_BASE || !fam) return new Response("Missing", { status: 400 });
  const u = await fetch(`${API_BASE}/posts/${params.id}/comments`, {
    method: "POST",
    headers: { "X-Family": fam, "Content-Type": "application/json" },
    body: await req.text(),
    cache: "no-store"
  });
  return new Response(await u.text(), { status: u.status, headers: { "content-type": u.headers.get("content-type") || "application/json" } });
}