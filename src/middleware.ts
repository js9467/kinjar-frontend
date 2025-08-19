// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Minimal, non-destructive middleware:
 * - Does NOT rewrite or redirect anything.
 * - (Optional) attaches x-tenant header if subdomain is present.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const host = req.headers.get("host") || "";
  const base = process.env.TENANT_BASE_DOMAIN; // e.g. "kinjar.com"

  if (base && host.endsWith(`.${base}`) && host !== base && host !== `www.${base}`) {
    const sub = host.slice(0, -(`.${base}`).length);
    if (sub) res.headers.set("x-tenant", sub);
  }

  return res;
}

export const config = {
  // Skip static assets and image optimizer
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
