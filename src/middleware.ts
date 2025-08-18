import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { tenantFromHost } from "@/lib/tenant";

const PROTECTED = [/^\/admin/, /^\/api\/posts/, /^\/api\/tenants/];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";
  const tenant = tenantFromHost(host);

  // Enforce auth on protected paths
  if (PROTECTED.some((re) => re.test(url.pathname))) {
    const session = await auth();
    if (!session?.user) {
      url.pathname = "/api/auth/signin";
      return NextResponse.redirect(url);
    }
  }

  // Attach tenant slug as header for API routes
  if (url.pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    if (tenant) res.headers.set("x-tenant-slug", tenant);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|public).*)"],
};
