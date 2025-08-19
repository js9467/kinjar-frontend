// src/lib/server-auth.ts
import { headers } from "next/headers";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.kinjar.com";
export async function requireRoot() {
  const cookie = (await headers()).get("cookie") ?? "";
  const r = await fetch(`${API_BASE}/auth/me`, { headers: { cookie }, cache: "no-store" });
  if (!r.ok) return null;
  const me = await r.json();
  return me?.user?.global_role === "ROOT" ? me : null;
}
