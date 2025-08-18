// app/api/presign/route.ts
import { NextRequest, NextResponse } from "next/server"

const FLY_BASE = process.env.KINJAR_API_BASE!          // e.g. https://kinjar-api.fly.dev
const FLY_KEY  = process.env.KINJAR_API_KEY!           // server-only secret

function tenantFromHost(host?: string | null) {
  if (!host) return null
  // Ignore Vercel preview hosts like xxx.vercel.app
  if (host.includes(".vercel.app")) return null
  const parts = host.split(".")
  if (parts.length < 3) return null // likely apex (kinjar.com) or app.kinjar.com
  const sub = parts[0]
  if (["kinjar", "www", "app", "localhost"].includes(sub)) return null
  return sub
}

export async function POST(req: NextRequest) {
  try {
    if (!FLY_BASE || !FLY_KEY) {
      return NextResponse.json(
        { ok: false, error: "Server not configured: KINJAR_API_BASE/KINJAR_API_KEY" },
        { status: 500 }
      )
    }

    const json = await req.json().catch(() => ({} as any))
    const filename = String(json.filename ?? "upload")
    const contentType = String(json.contentType ?? "application/octet-stream")
    const explicitTenant = json.tenantSlug ? String(json.tenantSlug) : null

    const host = req.headers.get("host")
    const derivedTenant = tenantFromHost(host)
    const tenantSlug = explicitTenant ?? derivedTenant

    if (!tenantSlug) {
      return NextResponse.json({ ok: false, error: "Missing tenant slug" }, { status: 400 })
    }

    // Server-to-server call to Fly (secret stays server-side)
    const flyRes = await fetch(`${FLY_BASE}/presign`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": FLY_KEY,
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({ filename, contentType }),
      // ensure no caching of presign responses
      cache: "no-store",
      // @ts-expect-error next options in edge/runtime
      next: { revalidate: 0 },
    })

    const data = await flyRes.json().catch(() => ({}))
    if (!flyRes.ok || !data?.ok) {
      const msg = typeof data?.error === "string" ? data.error : "Fly presign failed"
      return NextResponse.json({ ok: false, error: msg }, { status: 502 })
    }

    // { ok: true, key, presign: { url, fields: {...} } }
    return NextResponse.json(data, {
      headers: {
        "cache-control": "no-store",
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unexpected error" },
      { status: 500 }
    )
  }
}
