import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = "kinjar.com";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";
  const res = NextResponse.next();

  let family: string | null = null;

  if (host.includes("localhost") || /^[0-9.]+$/.test(host)) {
    family = req.cookies.get("family")?.value || process.env.KINJAR_LOCAL_FAMILY || null;
  } else {
    const parts = host.toLowerCase().split(".");
    if (parts.length >= 3 && host.toLowerCase().endsWith(ROOT_DOMAIN)) {
      family = parts[0]; // <family>.kinjar.com
    }
  }

  if (family) {
    res.cookies.set("family", family, { path: "/", httpOnly: false, sameSite: "lax" });
    if (url.pathname === "/") {
      url.pathname = `/${family}`; // rewrite subdomain root to /[family]
      return NextResponse.rewrite(url, res);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/).*)"],
};