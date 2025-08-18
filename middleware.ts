import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  let family: string | null = null;

  if (hostname.includes("localhost") || /^[0-9.]+$/.test(hostname)) {
    family = process.env.KINJAR_LOCAL_FAMILY || null;
  } else {
    const parts = hostname.toLowerCase().split(".");
    if (parts.length >= 3 && parts[1] === "kinjar" && parts[2] === "com") {
      family = parts[0]; // subdomain
    }
  }

  const res = NextResponse.next();
  if (family) {
    res.cookies.set("family", family, { path: "/", httpOnly: false });
  }
  return res;
}