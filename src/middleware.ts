import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BASE = (process.env.TENANT_BASE_DOMAIN || "kinjar.com").toLowerCase();

function extractHost(hostHeader: string): string {
  // Strip port if present
  return hostHeader.split(":")[0].toLowerCase();
}

function tenantFromHost(host: string): string | null {
  // Handle localhost dev (tenant.localhost:3000)
  if (host.endsWith(".localhost")) {
    const parts = host.split(".");
    return parts.length > 2 ? parts[0] : null;
  }

  const baseParts = BASE.split(".").reverse(); // ["com","kinjar"]
  const hostParts = host.split(".").reverse(); // ["com","kinjar","tenant"]

  // If host doesn't end with BASE, no tenant
  for (let i = 0; i < baseParts.length; i++) {
    if (hostParts[i] !== baseParts[i]) return null;
  }

  // Host equals base (kinjar.com / www.kinjar.com)
  if (hostParts.length === baseParts.length) return null;
  if (host.startsWith("www.")) return null;

  // First label before base is the tenant
  const partsForward = host.split(".");
  return partsForward[0];
}

export function middleware(req: NextRequest) {
  const host = extractHost(req.headers.get("host") || "");
  const tenant = tenantFromHost(host);

  const requestHeaders = new Headers(req.headers);
  if (tenant) requestHeaders.set("x-tenant-slug", tenant);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  // Run on everything so tenant header is always available
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"]
};
