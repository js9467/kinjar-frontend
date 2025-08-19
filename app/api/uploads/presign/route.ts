// CHANGE: stop using "@/auth"
import { auth } from '@/src/auth';


export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const host = (req.headers.get("host") || "").toLowerCase();
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug =
    host === base || !host.endsWith(`.${base}`) ? "www" : host.split(".")[0];

  const body = await req.json();
  const res = await fetch(`${process.env.KINJAR_API_URL}/presign`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.KINJAR_API_KEY!,
      "x-tenant-slug": slug,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    return new Response(JSON.stringify({ ok: false, error: data?.error || "presign failed" }), { status: 500 });
  }
  return Response.json(data);
}
