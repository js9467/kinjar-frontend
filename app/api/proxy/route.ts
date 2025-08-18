export const runtime = "nodejs"; // IMPORTANT for Vercel (avoid the nodejs18.x error)

import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const API_BASE = process.env.KINJAR_API_BASE!;
  const family = req.cookies.get("family")?.value || process.env.KINJAR_LOCAL_FAMILY || "demo";

  const r = await fetch(`${API_BASE}/health`, {
    headers: { "X-Family": family }
  });

  return new Response(await r.text(), { status: r.status, headers: { "content-type": r.headers.get("content-type") || "text/plain" } });
}