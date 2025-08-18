
import { auth } from "../../../src/auth";
import { db } from "../../../src/lib/db";
import { z } from "zod";



const CreateBody = z.object({
  kind: z.enum(["TEXT","PHOTO","VIDEO"]),
  title: z.string().optional(),
  body: z.string().optional(),
  mediaKey: z.string().optional(),
  mediaType: z.string().optional(),
  mediaSize: z.number().optional(),
  isPublic: z.boolean().default(false),
  audience: z.enum(["EVERYONE","ADULTS_ONLY","KIDS"]).default("EVERYONE"),
  unlockAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const host = (req.headers.get("host") || "").toLowerCase();
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug = host.endsWith(`.${base}`) ? host.split(".")[0] : null;
  if (!slug) return new Response("Tenant missing", { status: 400 });

  const member = await db.membership.findFirst({
    where: { userId: session.user.id, tenant: { slug } },
    select: { tenantId: true, role: true },
  });
  if (!member) return new Response("Forbidden", { status: 403 });

  const body = CreateBody.parse(await req.json());

  const post = await db.post.create({
    data: {
      tenantId: member.tenantId,
      authorId: session.user.id,
      kind: body.kind,
      title: body.title,
      body: body.body,
      mediaKey: body.mediaKey,
      mediaType: body.mediaType,
      mediaSize: body.mediaSize,
      isPublic: body.isPublic,
      audience: body.audience,
      unlockAt: body.unlockAt ? new Date(body.unlockAt) : null,
    },
  });

  return Response.json({ ok: true, post });
}

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const host = (req.headers.get("host") || "").toLowerCase();
  const base = process.env.PUBLIC_BASE_DOMAIN!;
  const slug = host.endsWith(`.${base}`) ? host.split(".")[0] : null;
  if (!slug) return new Response("Tenant missing", { status: 400 });

  const member = session?.user
    ? await db.membership.findFirst({
        where: { userId: session.user.id, tenant: { slug } },
        select: { role: true },
      })
    : null;

  const posts = await db.post.findMany({
    where: { tenant: { slug } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  const now = new Date();
  const visible = posts.filter((p) => {
    const locked = p.unlockAt && p.unlockAt > now;
    if (!locked) return true;
    const role = member?.role;
    return (session?.user?.globalRole === "ROOT") || role === "ADMIN" || role === "OWNER";
  }).filter((p) => {
    if (!member) return p.isPublic;
    return true;
  });

  return Response.json({ ok: true, posts: visible });
}
