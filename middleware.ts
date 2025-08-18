import { NextResponse, type NextRequest } from "next/server";

function sanitizeFamily(f: string | null) {
  const v = (f || "").trim().toLowerCase();
  return v && /^[a-z0-9_-]{1,48}$/.test(v) ? v : null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const res = NextResponse.next();

  // If ?family= is present anywhere, set a cookie then clean the URL
  const qp = sanitizeFamily(url.searchParams.get("family"));
  if (qp) {
    res.cookies.set("family", qp, { path: "/", httpOnly: false, sameSite: "lax" });
    url.searchParams.delete("family");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = { matcher: ["/((?!_next/|api/).*)"] };