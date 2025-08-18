// middleware.ts (root)
import { NextResponse, type NextRequest } from "next/server";
export const config = { matcher: ["/:path*"] };
export function middleware(_req: NextRequest) { return NextResponse.next(); }
