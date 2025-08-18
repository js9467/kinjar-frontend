import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();

  // 1) Query param wins
  const qFamily = url.searchParams.get("family");
  if (qFamily) {
    res.cookies.set("family", qFamily.toLowerCase(), { path: "/", httpOnly: false, sameSite: "lax" });
    return res;
  }

  // 2) Subdomain (ignore www)
  const host = req.headers.get("host") || "";
  const parts = host.split(".");
  if (parts.length >= 3) {
    const sub = parts[0].toLowerCase();
    if (sub !== "www") {
      res.cookies.set("family", sub, { path: "/", httpOnly: false, sameSite: "lax" });
      return res;
    }
  }

  // 3) Default if cookie missing
  if (!req.cookies.get("family")?.value) {
    res.cookies.set("family", "slaughterbecks", { path: "/", httpOnly: false, sameSite: "lax" });
  }

  return res;
}
