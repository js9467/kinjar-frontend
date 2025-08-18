export const runtime = "nodejs";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const API_BASE = process.env.KINJAR_API_BASE || "";

export async function POST(req: NextRequest) {
  if (!API_BASE) {
    return new Response("KINJAR_API_BASE not set", { status: 500 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Prefer cookie; allow explicit override via body.family if present
  const cookieFamily = cookies().get("family")?.value || null;
  const family = (payload?.family as string) || cookieFamily;
  if (!family) {
    return new Response("Missing family (cookie or body.family)", { status: 400 });
  }

  // Forward to your Fly API with X-Family
  const upstream = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Family": family,
    },
    body: JSON.stringify({
      kind: payload.kind,
      body: payload.body,
      image_url: payload.image_url,
      public: !!payload.public,
      author: payload.author || undefined,
    }),
    cache: "no-store",
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
  });
}