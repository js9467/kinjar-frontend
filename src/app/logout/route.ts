import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.kinjar.com";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  await fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: { cookie } }).catch(() => {});
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
