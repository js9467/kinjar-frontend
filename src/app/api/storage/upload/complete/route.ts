import { NextRequest } from "next/server";

const BACKEND = process.env.FLY_BACKEND_URL || "https://kinjar-api.fly.dev";
const API_KEY = process.env.FLY_API_KEY!;

function extractHost(hostHeader: string): string {
  return (hostHeader || "").split(":")[0].toLowerCase();
}

function tenantFromHost(host: string): string | null {
  const base = (process.env.TENANT_BASE_DOMAIN || "kinjar.com").toLowerCase();
  if (host.endsWith(".localhost")) {
    const parts = host.split(".");
    return parts.length > 2 ? parts[0] : null;
  }
  if (!host.endsWith(base)) return null;
  if (host.startsWith("www.")) return null;
  const parts = host.split(".");
  if (parts.length <= base.split(".").length) return null;
  return parts[0];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const host = extractHost(req.headers.get("host") || "");
  const tenantHeader = req.headers.get("x-tenant-slug");
  const tenant = tenantHeader || tenantFromHost(host);

  const r = await fetch(`${BACKEND}/upload/complete`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      ...(tenant ? { "x-tenant-slug": tenant } : {})
    },
    body: JSON.stringify(body)
  });

  const data = await r.text();
  return new Response(data, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") || "application/json" }
  });
}
